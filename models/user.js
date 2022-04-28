const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Vendor = require('./vendor');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      requied: true,
    },
    lastName: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    phoneNoVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      require: true,
      minlength: 8,
    },
    passwordChangedAt: Date,
    status: {
      type: String,
      default: 'pending', // status is pending until phoneNo is verified: phoneNoVerified: true
      enum: ['active', 'inactive', 'suspended', 'pending'],
    },
    role: {
      type: String,
      enum: ['vendor'],
      default: 'vendor',
    },
  },
  { timestamps: true },
);

// Bcrypting the password and saving it to db
userSchema.pre('save', async function (next) {
  try {
    if (this.firstName.length < 3) {
      throw new Error('First name should contain atleast 3 letters');
    }

    next();
  } catch (error) {
    console.log('user presave error', error.message);
  }
});

userSchema.statics.createUser = async function (data) {
  const errors = {};

  if (data.phoneNo) {
    const duplicatePhoneNo = await this.findOne({ phoneNo: data.phoneNo });
    if (duplicatePhoneNo) {
      errors.phoneNo = 'Phone Number already exists';
    }
  }

  if (data.email) {
    const duplicateEmail = await this.findOne({ email: data.email });
    if (duplicateEmail) {
      errors.email = 'Email already exists';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw { name: 'object', message: JSON.stringify(errors) };
  }

  data.password = await bcrypt.hash(data.password, 12);

  const user = await this.create({ ...data });

  const vendor = await Vendor.create({
    ...data,
    userId: user._id,
    displayName: `${user.firstName} ${user.lastName}`,
  });

  return {
    vendorId: vendor._id,
    userId: user._id,
    phoneNo: vendor.phoneNo,
  };
};

userSchema.statics.updatePhoneVerification = async function (phoneNo) {
  try {
    const user = await this.findOneAndUpdate(
      { phoneNo },
      {
        phoneNoVerified: true,
        status: 'active',
      },
    );
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

userSchema.statics.updatePhoneNo = async function (oldPhoneNo, newPhoneNo) {
  try {
    console.log('oldPhoneNo', oldPhoneNo);
    console.log('newPhoneNo', newPhoneNo);
    const user = await this.findOneAndUpdate(
      { phoneNo: oldPhoneNo },
      {
        phoneNo: newPhoneNo,
        phoneNoVerified: false,
      },
    );
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

userSchema.statics.updatePassword = async function (data) {
  try {
    const password = await bcrypt.hash(data.password, 12);
    const passwordChangedAt = Date.now();

    const user = await this.findOneAndUpdate(
      { phoneNo: data.phoneNo },
      {
        password,
        passwordChangedAt,
      },
    );
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

userSchema.statics.login = async function (data) {
  try {
    const vendor = await Vendor.findOne({
      phoneNo: `+${+data.phoneNo}`,
    }).populate('userId');
    console.log({ vendor });
    if (!vendor) {
      throw new Error('Phone number does not exist');
    }

    const isPasswordMatched = await bcrypt.compare(
      data.password,
      vendor.userId.password,
    );
    if (!isPasswordMatched) {
      throw new Error('Incorrect password');
    }

    if (!vendor.userId.phoneNoVerified) {
      throw new Error('Phone number not verified!');
    }

    if (vendor.userId.status !== 'active') {
      throw new Error(
        'User is not active. Please contact admin to resolve the issue!',
      );
    }

    return {
      vendorId: vendor._id,
      userId: vendor.userId._id,
      phoneNo: vendor.phoneNo,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

userSchema.statics.matchPassword = async function (id, req_password) {
  const password = await this.findOne({ _id: id }).select('password');

  // const hashedPassword = await bcrypt.hash(req_password, 12);

  const isPasswordMatched = await bcrypt.compare(
    req_password,
    password.password,
  );

  return isPasswordMatched;
};

userSchema.statics.updateName = async function (id, data) {
  try {
    const user = await this.findOneAndUpdate(
      { _id: id },
      {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    );
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = mongoose.model('user', userSchema);
