const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./user');

/**
 *
 * @field balance
 * @description Current Earnings of the vendor
 *
 * @field hasAcceptedTerms
 * @description Has vendor accepted platforms terms and conditions or not
 *
 * @field socialHandles
 * @description URLs of different social media accounts reflecting the vendor
 *
 */

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: 'user',
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNo: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    hasAcceptedTerms: {
      type: Boolean,
      default: false,
    },
    socialHandles: {
      tiktok: '',
      instagram: '',
      facebook: '',
      twitter: '',
    },
    profitMargin: {
      type: Number,
      default: 0.70,
    },
    paymentMethod: {
      type: String,
      enum: ['stripe'],
      default: 'stripe',
    },
  },
  { timestamps: true },
);

vendorSchema.statics.getVendorInfo = async function (req) {
  const vendor = await this.findOne({ _id: req.userData.vendorId })
    .populate({
      path: 'userId',
      select: 'firstName lastName email phoneNo password',
    })
    .lean();

  return vendor;
};

vendorSchema.statics.updatePhoneNo = async function (oldPhoneNo, newPhoneNo) {
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

// update vendor name
vendorSchema.statics.updateName = async function (id, data) {
  try {
    console.log('id', id);
    console.log('data', data);
    const vendor = await this.findOneAndUpdate(
      { userId: id },
      {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`,
      },
    );
    return vendor;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = mongoose.model('vendor', vendorSchema);
