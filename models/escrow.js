const mongoose = require('mongoose');
const { PENDING, RELEASED } = require('../constants/statuses');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Vendor = require('../models/vendor');

const escrowSchema = new mongoose.Schema(
  {
    vendorId: {
      type: ObjectId,
      ref: 'vendor',
      required: true,
    },
    orderId: {
      type: ObjectId,
      ref: 'order',
      required: true,
    },
    totalProfit: Number,
    vendorProfit: Number,
    merchpalsProfit: Number,
    releaseDate: Date,
    status: {
      type: String,
      enum: [PENDING, RELEASED],
    },
  },
  { timestamps: true },
);

escrowSchema.statics.getEscrowTransactions = async function (vendorId) {
  try {
    const escrows = await this.find({ vendorId: vendorId });
    return escrows;
  } catch (error) {
    console.log('getEscrowTransactions', error.message);
    throw error;
  }
};

escrowSchema.statics.calculatePendingEscrowsForVendor = async function (
  vendorId,
) {
  const escrows = await this.find({ vendorId: vendorId, status: PENDING });
  const totalPendingBalance = escrows.reduce((acc, escrow) => {
    return acc + escrow.vendorProfit;
  }, 0);

  const numberOfTransactions = escrows.length;

  return { totalPendingBalance, numberOfTransactions };
};

module.exports = mongoose.model('escrow', escrowSchema);
