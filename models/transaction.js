const mongoose = require('mongoose');
const Vendor = require('./vendor');
const VendorStripInfo = require('./vendorStripInfo');
const { SUCCEEDED, FAILED, PENDING } = require('../constants/statuses');
const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 *
 * @field amount
 * @description
 *
 * @field totalPayout
 * @description
 *
 */
const transactionSchema = new mongoose.Schema(
  {
    stripePaymentId: {
      type: ObjectId,
    },
    vendorId: {
      type: ObjectId,
      ref: 'vendor',
      required: true,
    },
    stripeAccountId: {
      type: String,
      required: true,
    },
    totalPayout: {
      type: Number,
    },
    //TODO: what are transaction statuses here. e.g. pending, delivered. failed
    status: {
      type: String,
      enum: [PENDING, SUCCEEDED, FAILED],
      required: true,
      default: PENDING,
    },
  },
  { timestamps: true },
);

transactionSchema.statics.initiatePayout = async function (vendorId) {
  const vendor = await Vendor.findOne({ _id: vendorId });
  const vendorStripeAcc = await VendorStripInfo.findOne({ vendorId }).sort({
    createdAt: -1,
  });
  const transaction = await this.create({
    vendorId,
    stripeAccountId: vendorStripeAcc.stripeAccountId,
    totalPayout: vendor.balance,
  });

  return transaction;
};

// transactionSchema.statics.updatePayout = async function (
//   transaction,
//   stripeTransfer,
// ) {
//   const updatedTransaction = await this.findById(transaction._id);
//   if (stripeTransfer.id !== '') {
//     updatedTransaction.status = SUCCEEDED;
//     const vendor = await Vendor.findOne({ _id: transaction.vendorId });
//     vendor.balance = 0;
//     await vendor.save();
//   } else {
//     updatedTransaction.status = FAILED;
//   }

//   await updatedTransaction.save();

//   return updatedTransaction;
// };

transactionSchema.statics.handleFailedPayout = async function (transaction) {
  const updatedTransaction = await this.findById(transaction._id);
  updatedTransaction.status = FAILED;
  await updatedTransaction.save();

  return updatedTransaction;
};

transactionSchema.statics.handleSuccessfulPayout = async function (
  transaction,
) {
  const updatedTransaction = await this.findById(transaction._id);
  updatedTransaction.status = SUCCEEDED;

  const vendor = await Vendor.findOne({ _id: transaction.vendorId });
  vendor.balance = 0;
  await vendor.save();

  await updatedTransaction.save();

  return updatedTransaction;
};

transactionSchema.statics.transactionHistory = async function (vendorId) {
  const vendor = await Vendor.findOne({ _id: vendorId }).lean();
  const transactions = await this.find({ vendorId }).sort({ createdAt: -1 });
  return { ...vendor, transactions };
};

module.exports = mongoose.model('transaction', transactionSchema);
