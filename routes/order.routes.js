const router = require('express').Router();
const { createOrder, trackOrder } = require('../controller/order');
const auth = require('../middleware/auth');

router.route('/').post(createOrder);
router.route('/track-order').post(trackOrder);

module.exports = router;
