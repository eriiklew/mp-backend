const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Design = require('./design');
const VendorProduct = require('./vendorProduct');
const Vendor = require('./vendor');
const labelledSingleProduct = require('../utils/labelledSingleProduct');
const labelledProductMappings = require('../utils/variantMappings');
const Product = require('./product');
const { systemRoutes } = require('../constants/systemRoutes');
const storeSchema = new mongoose.Schema(
  {
    vendorId: {
      type: ObjectId,
      ref: 'vendor',
      required: true,
    },
    vendorProductIds: {
      type: [ObjectId],
      ref: 'vendorProducts',
    },
    designs: {
      type: [ObjectId],
      ref: 'design',
    },
    productMappings: {
      type: [ObjectId],
      ref: 'productMapping',
      required: true,
    },
    coverAvatar: {
      type: String,
    },
    logo: {
      type: String,
    },
    theme: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    themeColor: {
      type: String,
      required: false,
      default: 'WHITE',
    },
    socialHandles: {
      tiktok: '',
      instagram: '',
      youtube: '',
      twitch: '',
    },
  },
  { timestamps: true },
);

storeSchema.statics.createStoreAndEssence = async function (userData, data) {
  const slug = data.name
    .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
    .toLowerCase()
    .split(' ')
    .join('-');

  const slugExists = await this.findOne({ slug });

  if (slugExists) {
    throw new Error('Slug already taken');
  }

  const storeId = mongoose.Types.ObjectId();
  const designId = mongoose.Types.ObjectId();

  const vendorId = await Vendor.findOne({ userId: userData._id });
  let allProductsMappings = [];
  let formattedVendorProducts = [];
  data.products.forEach(product => {
    allProductsMappings.push(...product.productMappings);
  });

  const productIds = data.products.map(p => p.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  data.products.forEach(product => {
    const dbProduct = products.find(p => p._id.equals(product.productId));
    const price = dbProduct.minPrice;

    formattedVendorProducts.push({
      productId: product.productId,
      designId,
      storeId,
      productMappings: product.productMappings,
      price,
    });
  });

  const vendorProducts = await VendorProduct.insertMany(formattedVendorProducts);

  let frontDesignImages, backDesignImages;
  const canvasModes = data.canvasModes;
  if (canvasModes.front == false && canvasModes.back == true) {
    frontDesignImages = data.urls.filter((design, idx) => idx > 1 && idx < 5);
    backDesignImages = data.urls.filter((design, idx) => idx > 4 && idx < data.urls.length - 1);
  } else if (canvasModes.front == true && canvasModes.back == false) {
    frontDesignImages = data.urls.filter((design, idx) => idx > 1 && idx < 7);
    backDesignImages = [];
  } else if (canvasModes.front == true && canvasModes.back == true) {
    frontDesignImages = data.urls.filter((design, idx) => idx > 1 && idx < 7);
    backDesignImages = data.urls.filter((design, idx) => idx > 7 && idx < data.urls.length - 1);
  }

  const frontDesignJson = data.urls.find(
    el => el.name === 'front-design.json' && 'front-design.json',
  );
  const backDesignJson = data.urls.find(el => el.name === 'back-design.json' && 'back-design.json');

  const logo = data.urls.find(el => el.name === 'logo.png');
  const coverAvatar = data.urls.find(el => el.name === 'cover-avatar.png');

  const newDesign = await Design.create({
    _id: designId,
    vendorId,
    vendorProductIds: vendorProducts,
    name: data.design.designName,
    frontDesign: {
      designJson: frontDesignJson?.imageUrl || '',
      designImages: frontDesignImages,
      shape: data.shapes.front,
      mobileBackgroundImage: data?.mobileBackgroundImage?.front,
    },
    backDesign: {
      designJson: backDesignJson?.imageUrl || '',
      designImages: backDesignImages,
      shape: data.shapes.back,
      mobileBackgroundImage: data?.mobileBackgroundImage?.back,
    },
    storeId,
  });

  console.log('model store', data.themeColor);
  const store = await this.create({
    _id: storeId,
    name: data.name,
    vendorId,
    designs: [designId],
    logo: logo?.imageUrl,
    socialHandles: {
      youtube: data.youtube,
      twitch: data.twitch,
      instagram: data.instagram,
      tiktok: data.tiktok,
    },
    slug,
    coverAvatar: coverAvatar?.imageUrl,
    productMappings: allProductsMappings,
    vendorProductIds: vendorProducts.map(p => p._id),
    themeColor: data.themeColor,
  });

  const formattedStore = store.populate(['vendorId', 'designs', 'productMappings']);

  return formattedStore;
};
storeSchema.statics.createStoreAndEssenceAfter = async function (userData, data) {
  const slug = data.name
    .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
    .toLowerCase()
    .split(' ')
    .join('-');

  const slugExists = await this.findOne({ slug });

  if (slugExists) {
    throw new Error('Slug already taken');
  }

  const storeId = mongoose.Types.ObjectId();

  const vendorId = await Vendor.findOne({ userId: userData._id });
  console.log('vendor id', vendorId);
  const logo = data.urls.find(el => el.name === 'logo.png');
  const coverAvatar = data.urls.find(el => el.name === 'cover-avatar.png');

  const store = await this.create({
    _id: storeId,
    name: data.name,
    vendorId,
    logo: logo?.imageUrl,
    socialHandles: {
      youtube: data.youtube,
      twitch: data.twitch,
      instagram: data.instagram,
      tiktok: data.tiktok,
    },
    slug,
    coverAvatar: coverAvatar?.imageUrl,
    themeColor: data.themeColor,
  });
  console.log('create store successfully', store);
  return store;
};

storeSchema.statics.getLabeledInfo = async function (userId) {
  let vendor = await Vendor.findOne({ userId });
  let store = await this.findOne({ vendorId: vendor })
    .populate([
      { path: 'vendorId', select: 'displayName email phoneNumber avatar' },
      {
        path: 'vendorProductIds',
        select: 'designId productId productMappings price',
        populate: [
          {
            path: 'designId',
            select: 'name frontDesign backDesign',
            populate: [
              { path: 'frontDesign', select: 'designImages' },
              { path: 'backDesign', select: 'designImages' },
            ],
          },
          { path: 'productId', select: 'name image slug basePrice backImage' },
          { path: 'productMappings' },
        ],
      },
    ])
    .lean();

  store.vendorProductIds = labelledProductMappings(store.vendorProductIds);
  delete store.productMappings;
  return store;
};

storeSchema.statics.getLabeledInfoBySlug = async function (slug) {
  let store = await this.findOne({ slug })
    .populate([
      { path: 'vendorId', select: 'displayName email phoneNumber avatar' },
      {
        path: 'vendorProductIds',
        select: 'designId productId productMappings price',
        populate: [
          {
            path: 'designId',
            select: 'name frontDesign backDesign',
            populate: [
              { path: 'frontDesign', select: 'designImages' },
              { path: 'backDesign', select: 'designImages' },
            ],
          },
          { path: 'productId', select: 'name image slug basePrice backImage' },
          { path: 'productMappings' },
        ],
      },
    ])
    .lean();
  console.log('vendore', store);

  store.vendorProductIds = labelledProductMappings(store.vendorProductIds);
  delete store.productMappings;
  return store;
};

storeSchema.statics.getStoreProductInfo = async function (storeSlug, productId) {
  console.log({ storeSlug, productId });
  const store = await this.findOne({ slug: storeSlug });
  const productDetail = await VendorProduct.findOne({
    _id: productId, // need to be vendor productID
  })
    .populate([
      {
        path: 'designId',
        select: 'name frontDesign backDesign',
        populate: [
          { path: 'frontDesign', select: 'designImages' },
          { path: 'backDesign', select: 'designImages' },
        ],
      },
      { path: 'productId', select: 'name image slug basePrice details shippingText backImage' },
      {
        path: 'productMappings',
        select: 'productId keyId variantId productNumberedId color variant',
      },
    ])
    .lean();

  let formattedProduct = {
    vendorProductId: productDetail._id,
    ...productDetail,
    ...productDetail.productId,
    productId: productDetail.productId._id,
    details: productDetail.productId.details,
    shippingText: productDetail.productId.shippingText,
  };

  delete formattedProduct.productId;
  const formattedMappings = labelledSingleProduct(formattedProduct);
  return formattedMappings;
};

storeSchema.statics.createDesign = async function (req, vendorId) {
  const data = req.body;

  let allProductsMappings = [];
  let formattedVendorProducts = [];

  const designId = mongoose.Types.ObjectId();
  const store = await this.findOne({ vendorId });

  const dataProducts = JSON.parse(data.products);

  const productIds = dataProducts.map(p => p.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  dataProducts.forEach(product => {
    const dbProduct = products.find(p => p._id.equals(product.productId));
    const price = dbProduct.minPrice;

    allProductsMappings.push(...product.productMappings);
    formattedVendorProducts.push({
      productId: product.productId,
      designId,
      storeId: store._id,
      productMappings: product.productMappings,
      price,
    });
  });

  const vendorProducts = await VendorProduct.insertMany(formattedVendorProducts);

  let frontDesignImages, backDesignImages;

  const canvasModes = req.body.canvasModes;
  if (canvasModes.front == false && canvasModes.back == true) {
    frontDesignImages = data.urls.filter((design, idx) => idx < 3);
    backDesignImages = data.urls.filter((design, idx) => idx > 2 && idx < data.urls.length - 1);
  } else if (canvasModes.front == true && canvasModes.back == false) {
    frontDesignImages = data.urls.filter((design, idx) => idx < 5);
    backDesignImages = [];
  } else if (canvasModes.front == true && canvasModes.back == true) {
    frontDesignImages = data.urls.filter((design, idx) => idx < 5);
    backDesignImages = data.urls.filter((design, idx) => idx > 5 && idx < data.urls.length - 1);
  }

  const frontDesignJson = data.urls.find(el => el.name === 'front-design.json');
  const backDesignJson = data.urls.find(el => el.name === 'back-design.json');

  const newDesign = await Design.create({
    _id: designId,
    vendorId,
    vendorProductIds: vendorProducts,
    name: data.designName,
    frontDesign: {
      designJson: frontDesignJson?.imageUrl || '',
      designImages: frontDesignImages,
      shape: data.shapes.front,
      mobileBackgroundImage: data?.mobileBackgroundImage?.front,
    },
    backDesign: {
      designJson: backDesignJson?.imageUrl || '',
      designImages: backDesignImages,
      shape: data.shapes.back,
      mobileBackgroundImage: data?.mobileBackgroundImage?.back,
    },
    storeId: store,
  });

  store.vendorProductIds = [...store.vendorProductIds, ...vendorProducts];
  store.designs = [...store.designs, newDesign];

  await store.save();

  return newDesign;
};

storeSchema.statics.getDesigns = async function (vendorId) {
  const store = await this.findOne({ vendorId }).populate({
    path: 'designs',
    select: 'name frontDesign backDesign',
    populate: [
      { path: 'frontDesign', select: 'designImages' },
      {
        path: 'backDesign',
        select: 'designImages',
      },
    ],
  });
  return store.designs;
};

storeSchema.statics.getSingleDesign = async function (designId) {
  const design = await Design.findOne({ _id: designId }, 'name frontDesign backDesign', {
    populate: [
      { path: 'frontDesign', select: 'designJson' },
      { path: 'backDesign', select: 'designJson' },
    ],
  });

  return design;
};

storeSchema.statics.getSingleDesignProducts = async function (designId) {
  const design = await Design.findOne({ _id: designId })
    .populate({
      path: 'vendorProductIds',
      select: 'designId productId productMappings price',
      populate: [
        { path: 'designId', select: 'name frontDesign backDesign' },
        { path: 'productId', select: 'name image slug basePrice backImage' },
        { path: 'productMappings' },
      ],
    })
    .lean();

  design.vendorProductIds = labelledProductMappings(design.vendorProductIds);
  return design;
};

storeSchema.statics.updateStoreData = async function (store) {
  const storeResult = await this.findOne({ _id: store.storeId });
  storeResult.name = store.name;
  storeResult.slug = store.slug;
  storeResult.logo = store.logo;
  storeResult.coverAvatar = store.coverAvatar;
  storeResult.themeColor = store.themeColor;
  await storeResult.save();
  return storeResult;
};
storeSchema.statics.ValidateStoreSlug = async function (storeName) {
  const slug = storeName
    .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
    .toLowerCase()
    .split(' ')
    .join('-');
  const routeInclude = systemRoutes.includes(slug);
  console.log('router include or not', routeInclude);
  if (routeInclude) {
    return routeInclude;
  } else {
    const slugExists = await this.findOne({ slug });
    return slugExists;
  }
};

storeSchema.statics.updateDesign = async function (designId, vendorId, data) {
  console.log({ data });
  console.log({ designId, vendorId, data });
  const store = await this.findOne({ vendorId });
  const previousVendorProducts = await VendorProduct.find({
    designId,
    storeId: store,
  });
  console.log({ previousVendorProducts });
  store.vendorProductIds = store.vendorProductIds.filter(
    vpId => !previousVendorProducts.some(p => p._id.equals(vpId)),
  );

  await VendorProduct.find({
    _id: { $in: previousVendorProducts },
  });

  let allProductsMappings = [];
  let formattedVendorProducts = [];

  const productIds = data.updatedProducts.map(p => p.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  data.updatedProducts.forEach(product => {
    let price = 0;
    const updatedProduct = data.vendorUpdatedPrices[product.productId];
    if (updatedProduct) {
      price = updatedProduct.price;
    } else {
      const dbProduct = products.find(p => p._id.equals(product.productId));
      price = dbProduct.minPrice;
    }

    allProductsMappings.push(...product.productMappings);
    formattedVendorProducts.push({
      productId: product.productId,
      designId,
      storeId: store._id,
      productMappings: product.productMappings,
      price,
    });
  });

  const vendorProducts = await VendorProduct.insertMany(formattedVendorProducts);

  const updatedDesign = await Design.updateOne(
    { _id: designId },
    {
      vendorProductIds: vendorProducts,
    },
  );

  store.vendorProductIds = [...store.vendorProductIds, ...vendorProducts];

  await store.save();

  return updatedDesign;
};

module.exports = mongoose.model('store', storeSchema);
