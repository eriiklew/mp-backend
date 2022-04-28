const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * @field productNumberedId
 * @description
 * 
 * @field variant
 * @description The value of this field depends on the product. 
 * 
 * @field color
 * @description
 * 
 * @field keyId
 * @description
 * 
 * @field variantId
 * @description
 * 
 */
const productMapping = new mongoose.Schema({
  productId: {
    type: ObjectId,
    ref: 'product',
  },
  productNumberedId: {
    type: Number,
    required: true,
  },
  variant: {
    type: { value: { type: Number, required: true }, label: { type: String, required: true } },
    required: true,
  },
  color: {
    type: { value: { type: Number, required: true }, label: { type: String, required: true } },
    required: true,
  },
  keyId: {
    type: String,
    required: true,
    unique: true,
  },
  variantId: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('productMapping', productMapping)