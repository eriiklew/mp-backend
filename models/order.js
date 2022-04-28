const mongoose = require('mongoose');
const VendorProduct = require('./vendorProduct');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Store = require('./store');
const { priceCalculation } = require('../services/printful');
const { mapColor } = require('../utils/colorAndVariantMappingForOrder');
const {
  DELETED,
  SUCCEEDED,
  PROCESSED_BY_PRINTFUL,
  RETURNED_BY_PRINTFUL,
  CANCELLED_BY_PRINTFUL,
} = require('../constants/statuses');

const TYPE = {
  package_shipped: PROCESSED_BY_PRINTFUL,
  package_returned: RETURNED_BY_PRINTFUL,
  order_canceled: CANCELLED_BY_PRINTFUL,
};

/**
 *
 * @field size
 * @field shippingCose
 * @field tax
 * @field totalAmount
 *
 */
const orderSchema = new mongoose.Schema(
  {
    products: {
      type: [
        {
          vendorProduct: {
            type: ObjectId,
            ref: 'vendorProducts',
            required: true,
          },
          productMapping: {
            type: ObjectId,
            ref: 'productMapping',
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
    },
    vendorId: {
      type: ObjectId,
      required: true,
    },
    storeId: {
      type: ObjectId,
      required: true,
      ref: 'store',
    },
    customer: {
      type: ObjectId,
      required: true,
      ref: 'customerRecord',
    },
    paymentId: {
      type: ObjectId,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: SUCCEEDED,
      enum: [
        SUCCEEDED,
        DELETED,
        PROCESSED_BY_PRINTFUL,
        RETURNED_BY_PRINTFUL,
        CANCELLED_BY_PRINTFUL,
      ],
    },
    printfulOrderMetadata: {
      type: Object,
    },
    orderNo: {
      type: Number,
    },
    billingAddress: {
      aptNo: {
        type: String,
      },
      street: {
        type: String,
        required: true,
      },
      zip: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true },
);

orderSchema.statics.createOrder = async function (
  orderId,
  recordId,
  paymentId,
  printfulData,
  slug,
) {
  const pricingResponse = await priceCalculation(printfulData);

  if (pricingResponse.code === 400) {
    throw new Error(pricingResponse.message);
  }

  const store = await Store.findOne({ slug }).select('_id vendorId');
  console.log(pricingResponse.shippingAmount);
  let order = new this();
  order._id = orderId;
  order.customer = recordId;
  order.paymentId = paymentId;
  order.storeId = store._id;
  order.vendorId = store.vendorId;
  order.products = printfulData.items;
  order.price = pricingResponse.orderActualAmount;
  order.tax = pricingResponse.taxRate;
  order.shippingCost =
    pricingResponse.shippingAmount === 'FREE' ? 0 : pricingResponse.shippingAmount;
  order.totalAmount = pricingResponse.amountWithTaxAndShipping;
  order.billingAddress = printfulData.recipient;

  await order.save();
  const fullOrder = await this.findOne({ _id: order._id }).populate([
    {
      path: 'customer',
    },
    {
      path: 'products',
      populate: [
        {
          path: 'vendorProduct',
          select: 'designId productId price',
          populate: [
            { path: 'designId', select: 'frontDesign backDesign' },
            { path: 'productId', select: 'name image minPrice basePrice slug backImage' },
          ],
        },
        { path: 'productMapping' },
      ],
    },
  ]);

  return fullOrder;
};

orderSchema.statics.getOrders = async function (vendorId) {
  let orders = await this.find({ vendorId })
    .populate([
      {
        path: 'customer',
      },
      {
        path: 'products',
        populate: [
          {
            path: 'vendorProduct',
            select: 'designId productId price',
            populate: [
              {
                path: 'designId',
                select: 'name frontDesign',
                populate: [{ path: 'frontDesign', select: 'designImages' }],
              },

              { path: 'productId', select: 'name image minPrice basePrice slug backImage' },
            ],
          },
          {
            path: 'productMapping',
            select: 'color',
          },
        ],
      },
    ])
    .lean();

  return orders;
};

orderSchema.statics.getOrderById = async function (orderId) {
  let order = await this.findOne({ _id: orderId })
    .populate([
      {
        path: 'customer',
      },
      {
        path: 'storeId',
        select: 'name',
      },
      {
        path: 'products',
        populate: [
          {
            path: 'vendorProduct',
            select: 'designId productId price',
            populate: [
              {
                path: 'designId',
                select: 'name frontDesign backDesign',
                populate: [{ path: 'frontDesign', select: 'designImages' }],
              },
              { path: 'productId', select: 'name image minPrice basePrice slug backImage' },
            ],
          },
          {
            path: 'productMapping',
          },
        ],
      },
    ])
    .lean();

  const mappedOrder = mapColor(JSON.parse(JSON.stringify(order)));
  return mappedOrder;
};
orderSchema.statics.getOrderByOrderNo = async function (orderNo) {
  const fullOrder = await this.findOne({ orderNo: orderNo }).populate([
    {
      path: 'customer',
    },
    {
      path: 'products',
      populate: [
        {
          path: 'vendorProduct',
          select: ' productId',
          populate: [{ path: 'productId', select: 'name' }],
        },
      ],
    },
  ]);
  return fullOrder;
};

orderSchema.statics.shipped = async function (type, printful_id) {
  const updatedOrder = await this.findOneAndUpdate(
    { orderNo: printful_id },
    { status: TYPE[type] },
  );
};

module.exports = mongoose.model('order', orderSchema);
