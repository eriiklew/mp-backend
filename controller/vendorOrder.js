const mongoose = require('mongoose');
const Order = require('../models/order');

const getOrders = async (req, res) => {
  try {
    const orders = await Order.getOrders(req.userData.vendorId);
    res.status(200).json({ orders, message: 'Orders fetched successfully' });
  } catch (error) {
    console.log('get orders controller', error);
    res.status(400).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.getOrderById(req.params.orderId);

    res.status(200).json({ order, message: 'Orders fetched successfully' });
  } catch (error) {
    console.log('get orders controller', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
};
