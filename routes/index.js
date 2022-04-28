const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const storeRoutes = require('./store.routes');
const orderRoutes = require('./order.routes');
const printfulRoutes = require('./printful.routes');
const vendorOrderRoutes = require('./vendorOrder.routes');
const vendorRoutes = require('./vendor.routes');
const contactRoutes = require('./contact.routes');
const stripeRoutes = require('./stripe.routes');
const cronJobRoutes = require('./cronJob.routes');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/store', storeRoutes);
router.use('/order', orderRoutes);
router.use('/printful', printfulRoutes);
router.use('/vendor/orders', vendorOrderRoutes);
router.use('/vendor', vendorRoutes);
router.use('/contact', contactRoutes);
router.use('/stripe', stripeRoutes);
router.use('/cron-job', cronJobRoutes);

module.exports = router;
