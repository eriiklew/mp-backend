const mongoose = require('mongoose');
const Order = require('../models/order');
const Customer = require('../models/customer');
const Payment = require('../models/payment');
const sendEmail = require('../utils/email');
const { DELETED } = require('../constants/statuses');
const design = require('../models/design');
const { productsSlug } = require('../constants/productMappings');
const axios = require('axios');
const PRINTFUL_API = 'https://api.printful.com';

const convert = str => {
  var date = new Date(str),
    mnth = ('0' + (date.getMonth() + 1)).slice(-2),
    day = ('0' + date.getDate()).slice(-2);
  return [date.getFullYear(), mnth, day].join('/');
};
const SendOrderEmail = async (order, req) => {
  let product = [],
    totalProducts = order.price,
    totalAmount = order.totalAmount;

  order.products.forEach(productitem => {
    product.push({
      productImg: productitem.vendorProduct.productId.image,

      designImg:
        productitem.vendorProduct.productId.slug === 'Case'
          ? productitem.vendorProduct.designId?.frontDesign?.designImages[3]?.imageUrl ||
            productitem.vendorProduct.designId?.frontDesign?.designImages[2]?.imageUrl
          : productitem.vendorProduct.productId.slug === 'poster' 
          ? productitem.vendorProduct.designId?.frontDesign?.designImages[4]?.imageUrl ||
            productitem.vendorProduct.designId?.frontDesign?.designImages[4]?.imageUrl
          : productitem.vendorProduct.designId?.frontDesign?.designImages[4]?.imageUrl ||
            productitem.vendorProduct.designId?.frontDesign?.designImages[4]?.imageUrl,
      productQuantity: productitem.quantity,
      productColorName: productitem.productMapping.color.label,
      productColor:
        productitem.productMapping.color.label === 'white'
          ? '#fff'
          : productitem.productMapping.color.label === 'navy'
          ? '#262d4f'
          : productitem.productMapping.color.label === 'black'
          ? '#121616'
          : productitem.productMapping.color.label,
      productName: productitem.vendorProduct.productId.name,
      productSlug: productitem.vendorProduct.productId.slug,
      productStatus: productitem.vendorProduct.productId.slug === 'Case' ?  true : productitem.vendorProduct.productId.slug === 'poster' ? true :false,
      productTotalAmount: (productitem.quantity * productitem.vendorProduct.price).toFixed(2),
      productSize: productitem.productMapping.variant.label,
    });
  });

  console.log({order: order})

  const replacements = {
    orderId: order.orderNo,
    customerFirstName: order.customer.firstName,
    customerLastName: order.customer.lastName,
    address: order.billingAddress.street,
    city: order.billingAddress.city,
    zip: order.billingAddress.zip,
    country: order.billingAddress.country,
    aptNo: order.billingAddress.aptNo,
    state: order.billingAddress.state,
    orderDate: convert(order.createdAt.toString()),
    totalProducts: totalProducts.toFixed(2),
    orderCost: (order.totalAmount - order.price).toFixed(2),
    totalShipping: 'FREE',
    totalOrder: totalAmount.toFixed(2),
    products: product,
    tickImg: req.get('origin') + '/assets/img/tick.png',
    faqUrl: req.get('origin') + '/faq',
  };

  let regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  replacements.country = regionNames.of(replacements.country);
  // replacements.orderDate = replacements.orderDate.slice(0, 10).replace(/-/g, '/');
  return replacements;
};

const createOrder = async (req, res) => {
  const orderId = mongoose.Types.ObjectId();
  const paymentId = mongoose.Types.ObjectId();
  const recordId = mongoose.Types.ObjectId();

  try {
    await Customer.createCustomer(req.body.customer, orderId, recordId);
    const order = await Order.createOrder(
      orderId,
      recordId,
      paymentId,
      req.body.printfulData,
      req.body.storeUrl,
    );

    await Payment.createAndChargeCustomer(req.body.payment, order, recordId, req.body.printfulData);
    const data = await SendOrderEmail(order, req);

    await sendEmail({
      email: req.body.customer.email,
      subject: `We got your order! (#${data.orderId})`,
      template: 'orderCreate',
      replacements: data,
      // text: 'rehman ali text',
    });

    res.status(200).json({ order, data, message: 'Order created successfully' });
  } catch (error) {
    await Order.findByIdAndUpdate(orderId, { $set: { status: DELETED } });
    await Payment.findByIdAndRemove(paymentId);

    res.status(400).json({ message: error.message });
  }
};

const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNo: req.body.orderNo,
    });
    if (!order) {
      throw new Error('Order not found');
    }

    const orderNo = req.body.orderNo;
    const printfulOrderId = parseInt(orderNo.slice(3));

    const response = await axios.get(`${PRINTFUL_API}/orders/${printfulOrderId}`, {
      headers: {
        authorization: `Basic ${process.env.PRINTFUL_API_KEY}`,
      },
    });

    const data = {
      orderNo,
      status: order.status,
      trackingNumber: response.data.result?.shipments[0]?.tracking_number,
      trackingUrl: response.data.result?.shipments[0]?.tracking_url,
      carrier: response.data.result?.shipments[0]?.carrier,
    };

    res.status(200).json({ data, message: 'Order tracked successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  trackOrder,
};
