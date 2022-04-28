const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  merchpalFee: {
    type: Number,
    default: 0.25
  }
});

module.exports = mongoose.model('setting', settingSchema)