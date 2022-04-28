const Product = require('../models/product');
const Store = require('../models/store');
const pairs = require('../constants/keyVariantPairs');
const ProductMapping = require('../models/productMapping');

const addProducts = async (req, res) => {
  try {
    const product = await Product.createProductAndMappings(req.body);
    res.status(200).json({ product, message: 'Product created successfully' });
  } catch (error) {
    console.log('addProducts', error.message);
    res.status(400).json({ message: error.message });
  }
};

const fetchProducts =  async (req, res) => {
  try {
    const products = await Product.getLabeledInfo();
    res.status(200).json({ products });
  } catch (error) {
    console.log('fetchProducts', error.message);
    res.status(400).json({ message: error.message });
  }
}; 

const productInfo = async (req, res) => {
  try {
    const  { storeUrl, productId } = req.params;
    const product = await Store.getStoreProductInfo(storeUrl, productId)
    res.status(200).json({ product })
  } catch (error) {
    console.log('productInfo', error.message);
    res.status(400).json({ message: error.message });
  }
}

const varaintToKeyIds = async(req, res) => {
  try {
    const productsMappings = await ProductMapping.find({}).select('keyId variantId')
    for(let item of productsMappings) {
      const keyIdStr = item.keyId.split('-').join('')
      await ProductMapping.findOneAndUpdate({_id: item._id}, {variantId: pairs[keyIdStr]})
    }
    
    res.status(200).json({ imported: "successfully" })
  } catch (error) {
    console.log('varaintToKeyIds', error.message);
    res.status(400).json({ message: error.message });
  }  
}

module.exports = {
  addProducts,
  fetchProducts,
  productInfo,
  varaintToKeyIds
}