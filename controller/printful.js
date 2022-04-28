const axios = require('axios');
const { priceCalculation } = require('../services/printful');
const Order = require('../models/order');
const sendEmail = require('../utils/email');

const calculatePrice = async (req, res) => {
  try {
    const data = req.body.data;
    const pricingResponse = await priceCalculation(data);
    if (pricingResponse.code === 400) {
      throw new Error(pricingResponse.message);
    }

    const payload = {
      ...pricingResponse,
    };
    res.status(200).json({ payload });
  } catch (error) {
    console.log('calculatePrice func', error, error.result);
    res.status(400).json({ message: error.message });
  }
};

const orderUpdate = async (req, res) => {
  try {
    const data = req.body.data;
    let productName = [];
    const orderId = req.query.testid ? parseInt(`900${req.query.testid}`) : data.order.order.id;
    await Order.shipped(req.body.type, orderId);
    if (req.body.type === 'package_shipped') {
      const order = await Order.getOrderByOrderNo(orderId);
      order.products.forEach(productitem => {
        productName.push(productitem.vendorProduct.productId.name);
      });
      const replacements = {
        carrier: data.shipment.service,
        tracking_number: data.shipment.tracking_number,
        tracking_url: data.shipment.tracking_url,
        orderNo: order.orderNo,
        customerFirstName: order.customer.firstName,
        customerLastName: order.customer.lastName,
        phone: order.customer.phoneNo,
        address: order.billingAddress.street,
        city: order.billingAddress.city,
        zip: order.billingAddress.zip,
        country: order.billingAddress.country,
        productName: productName.join(','),
      };
      const userEmail = order.customer.email;
      await sendEmail({
        email: userEmail,
        subject: `Your order is on the way! (${replacements.orderNo})`,
        template: 'shippedEmail',
        replacements: replacements,
      });
    }
    res.status(200).json({ message: 'Order updated' });
  } catch (error) {
    console.log('orderUpdate func', error, error.result);
    res.status(400).json({ message: error.message });
  }
};
module.exports = {
  calculatePrice,
  orderUpdate,
};
