const mongoose = require('mongoose');
const CustomerRecord = require('./customerRecord');
const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @field orderHistory
 * @description Array of ObjectIds of all the orders a customer has ever placed
 * @reference order table -> _id
 */
const customerSchema = new mongoose.Schema(
  {
    record: [ObjectId],
    phoneNo: {
      type: [String],
      required: true,
    },
    email: {
      type: [String],
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true },
);

customerSchema.statics.createCustomer = async function (customerInfo, orderId, recordId) {
  let customer = await this.findOne({
    phoneNo: { $in: [customerInfo.phoneNo] },
  });

  if (!customer) {
    customer = await this.findOne({
      email: { $in: [customerInfo.email] },
    });
  }

  if (!customer) {
    customer = new this();
  }

  const hasPhone = customer.phoneNo.find(p => p === customerInfo.phoneNo);
  if (!hasPhone) {
    customer.phoneNo = [...new Set([...customer.phoneNo, customerInfo.phoneNo])];
  }

  const hasEmail = customer.email.find(e => e === customerInfo.email);
  if (!hasEmail) {
    customer.email = [...new Set([...customer.email, customerInfo.email])];
  }

  await customer.save();
  await CustomerRecord.create({
    customerId: customer._id,
    _id: recordId,
    orderId,
    ...customerInfo,
  });

  return customer;
};

module.exports = mongoose.model('customer', customerSchema);
