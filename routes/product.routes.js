const router = require('express').Router();
const { 
  addProducts, 
  fetchProducts,
  productInfo,
  varaintToKeyIds
} = require('../controller/product');

router.route('/').post(addProducts)
router.route('/').get(fetchProducts)
router.route('/varaintToKeyIds').get(varaintToKeyIds);
router.route('/:storeUrl/product/:productId').get(productInfo)

module.exports = router;