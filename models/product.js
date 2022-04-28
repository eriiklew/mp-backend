const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const { productsSlug, productsConfig } = require('../constants/productMappings');
const ProductMapping = require('./productMapping');
const labelledProductMappings = require('../utils/colorMapping');
const pairs = require('../constants/keyVariantPairs');

/**
 *
 * @field productNumberedId
 * @description Like _id field this product will be unique to all products & more human readable
 * these readable Ids are defined in code and can never be changed
 *
 * @field slug
 * @description same as productNumberedId just string based ids
 *
 *
 * @field variants
 * @description
 *
 * @field colors
 * @description
 *
 * @field basePrice
 * @description
 *
 * @field costPrice
 * @description
 *
 * @field minPrice
 * @description
 *
 * @field shippingCost
 * @description
 *
 * @field background
 * @description
 *
 */
const productSchema = new mongoose.Schema(
  {
    productMappings: {
      type: [ObjectId],
      ref: 'productMapping',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    productNumberedId: {
      type: Number,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    backImage: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      enum: productsSlug,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    variants: {
      type: [{ value: { type: Number, required: true }, label: { type: String, required: true } }],
      required: true,
    },
    colors: {
      type: [{ value: { type: Number, required: true }, label: { type: String, required: true } }],
      required: true,
    },

    basePrice: {
      type: Number,
      required: true,
    },
    minPrice: {
      type: Number,
    },
    costPrice: {
      type: Number,
    },
    shippingCost: {
      type: Number,
    },
    tax: {
      type: Number,
    },
    background: {
      type: String,
    },
    details: {
      type: Array,
      required: true,
    },
    shippingText: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true },
);

productSchema.statics.getProductWithMappingsLabeled = async function (productId) {
  const product = await this.findOne(productId);
  const productConfig = productsConfig[product.slug];

  const mappedVariants = product.variants.map(v => {
    const configVariant = productConfig.variant[v];
    if (!configVariant) {
      throw new Error(`Invalid variant value: ${v}`);
    }
    return configVariant;
  });

  const mappedColors = product.colors.map(v => {
    const configColor = productConfig.color[v];
    if (!configColor) {
      throw new Error(`Invalid color value: ${v}`);
    }
    return configColor;
  });

  product.variants = mappedVariants;
  product.colors = mappedColors;

  const productMappings = await ProductMapping.find({ productId: product._id });
};

productSchema.statics.createProductAndMappings = async function (data) {
  data.productNumberedId = data.productNumberedId;
  data.slug = data.slug;

  // const mappedVariants = data.variants.map(v => {
  //   const variantObj = productConfig.variant;
  //   const configVariant = Object.keys(variantObj).find(pcv => variantObj[pcv] === v)
  //   if(!configVariant){
  //     throw new Error(`Invalid variant value: ${v}`)
  //   }
  //   return configVariant;
  // })

  // const mappedColors = data.colors.map(v => {
  //   const colorObj = productConfig.color;
  //   const configColor = Object.keys(colorObj).find(pcv => colorObj[pcv] === v)
  //   if(!configColor){
  //     throw new Error(`Invalid color value: ${v}`)
  //   }
  //   return configColor;
  // })

  // data.variants = data.variants;
  // data.colors = mappedColors.length > 0 ? mappedColors : ['0'];

  const product = await this.create({ ...data });
  let productVariantMapping = [];

  for (const variant of product.variants) {
    for (const color of product.colors) {
      productVariantMapping.push({
        productId: product._id,
        productNumberedId: product.productNumberedId,
        variant,
        color,
        keyId: `${product.productNumberedId}-${variant.value}-${color.value}`,
        variantId: pairs[`${product.productNumberedId}${variant.value}${color.value}`],
      });
    }
  }

  const productMappings = await ProductMapping.insertMany(productVariantMapping);
  product.productMappings = productMappings;
  await product.save();

  const productWithMappings = await this.findOne(product._id).populate('productMappings');

  return productWithMappings;
};

productSchema.statics.getLabeledInfo = async function () {
  const products = await this.find({}).populate('productMappings').lean();

  const formattedProducts = labelledProductMappings(products);

  return formattedProducts;
};

module.exports = mongoose.model('product', productSchema);
