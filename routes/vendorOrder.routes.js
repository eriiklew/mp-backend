const router = require('express').Router();
const { getOrders, getOrderById } = require('../controller/vendorOrder');
const auth = require('../middleware/auth');

router.route('/').get(auth, getOrders);
router.route('/:orderId').get(auth, getOrderById);

module.exports = router;
