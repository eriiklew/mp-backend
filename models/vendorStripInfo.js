const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const vendorStripInfoSchema = new mongoose.Schema(
  {
    vendorId: {
      type: ObjectId,
      ref: 'vendor',
    },
    stripeAccountId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('vendorStripInfo', vendorStripInfoSchema);
