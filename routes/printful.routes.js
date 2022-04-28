const express = require("express");
const router = express.Router();
const { calculatePrice, orderUpdate } = require('../controller/printful');

router.route('/calculate-price').post(calculatePrice);
router.route('/order-update').post(orderUpdate);

module.exports = router;
