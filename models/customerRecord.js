const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const customerRecordSchema = new mongoose.Schema({
  customerId: {
    type: ObjectId,
    required: true,
    ref: 'customer',
  },
  orderId: {
    type: ObjectId,
    ref: 'order',
  },
  firstName: {
    type: String,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
  },
  phoneNo: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
});

module.exports = mongoose.model('customerRecord', customerRecordSchema);
