const jwt = require('jsonwebtoken');
const twilioClient = require('../config/twilio');
const AppError = require('../utils/appError');
const { catchAsync } = require('./error');
const User = require('../models/user');
const Vendor = require('../models/vendor');

const twilioOtpService = async phoneNo => {
  try {
    const response = await twilioClient.verify
      .services(process.env.TWILIO_MERCHPALS_VERIFICATION_SERVICE)
      .verifications.create({
        to: phoneNo,
        channel: 'sms',
      });
    console.log({ twilioOtpService: response });
    return response;
  } catch (error) {
    console.log({ twilioOtpServiceError: error.message });
    return error.message;
  }
};

const getToken = user => {
  return jwt.sign(
    { phoneNo: user.phoneNo, userId: user.userId, vendorId: user.vendorId },
    process.env.AUTH_SECRET,
    { expiresIn: '10h' },
  );
};

exports.userSignup = async (req, res) => {
  try {
    const user = await User.createUser(req.body.data);
    let token;
    if (user && user.phoneNo) {
      token = getToken(user);
    }
    console.log({ token });
    const twillioResponse = await twilioOtpService(req.body.data.phoneNo);
    console.log({ twillioResponse });
    return res.status(200).json({
      token,
      message: 'SignUp Successful',
    });
  } catch (error) {
    if (error.name === 'object') {
      return res.status(400).send(error);
    }

    return res.status(400).send({ message: error.message });
  }
};

// TODO: We might do not need this function
// Delete after discussion if needed because does not even returns any value
exports.createVerificationService = catchAsync(async () => {
  // Create a verification service
  await twilioClient.verify.services.create({
    friendlyName: 'Merchpals',
    codeLength: 4,
  });
});

exports.sendOTP = catchAsync(async (req, res, next) => {
  const { phoneNo } = req.body;
  try {
    const verification = await twilioOtpService(phoneNo);
    return res.status(200).json({ verification });
  } catch (err) {
    throw next(new AppError(err.details, err.status));
  }
});

exports.verifyOTP = catchAsync(async (req, res) => {
  try {
    console.log(req.body.phoneNo);
    const otp = await twilioClient.verify
      .services(process.env.TWILIO_MERCHPALS_VERIFICATION_SERVICE)
      .verificationChecks.create({ to: req.body.phoneNo, code: req.body.code });

    console.log(otp);
    if (!otp.valid) {
      throw new Error('Invalid OTP!');
    }

    const user = await User.updatePhoneVerification(req.body.phoneNo);
    res.status(200).json({ user });
  } catch (err) {
    console.log('verifyOTP func', err.status, err.message);
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

exports.sendOTPForResetPassword = catchAsync(async (req, res) => {
  try {
    const { phoneNo } = req.body;
    await twilioOtpService(phoneNo);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.log('sendOTPForResetPassword func', err.status, err);
    res.status(400).json({ message: err.message });
  }
});

exports.updatePassword = catchAsync(async (req, res) => {
  try {
    const user = await User.updatePassword(req.body);
    res.status(200).json({ message: 'password updated successfully' });
  } catch (err) {
    console.log('updatePassword func', err.status, err);
    res.status(400).json({ message: err.message });
  }
});

exports.login = async (req, res) => {
  try {
    const user = await User.login(req.body);
    let token;

    if (user && user.phoneNo) {
      token = getToken(user);
    }

    res.status(200).json({
      token,
      message: 'Login Successful',
    });
  } catch (error) {
    console.log('login errorr', error);
    res.status(400).json({ message: error.message });
  }
};

exports.loggedInUserInfo = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userData._id }).select('-password');
    res.status(200).json({ user });
  } catch (error) {
    console.log('loggedInUserInfo errorr', error);
    res.status(400).json({ message: error.message });
  }
};

exports.sendOTPWithNewPhoneNo = catchAsync(async (req, res) => {
  try {
    const { oldPhoneNo, newPhoneNo } = req.body;

    const oldPhoneExists = await User.findOne({ phoneNo: newPhoneNo });
    if (oldPhoneExists) {
      throw new Error('Phone number already exists');
    }

    await twilioOtpService(newPhoneNo);
    await User.updatePhoneNo(oldPhoneNo, newPhoneNo);
    await Vendor.updatePhoneNo(oldPhoneNo, newPhoneNo);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.log('sendOTPWithNewPhoneNo func', err.status, err);
    res.status(400).json({ message: err.message });
  }
});
