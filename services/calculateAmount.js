/**
 * arrayOfProducts should of the following format
 * [
	        {
	            "quantity": 3,
	            "vendorProduct": "61ee70c586d1223fcce5e226",
	            "productMapping": "61ceb39b1b1b68fe90827f2b",
	            "variant_id": "5522"
	        },
	        {
	            "quantity": 2,
	            "vendorProduct": "61ee70c586d1223fcce5e228",
	            "productMapping": "61ceb3e41b1b68fe90827f5f",
	            "variant_id": "6239"
	        }
	    ]
 * In these objects only variant_id is optional
 */

const VendorProduct = require('../models/vendorProduct');

const calculateAmount = async arrayOfProducts => {
  const vendorProductIds = arrayOfProducts.map(a => a.vendorProduct);
  const vendorProducts = await VendorProduct.find({ _id: { $in: vendorProductIds } }).select(
    'price',
  );

  const amount = arrayOfProducts
    .map(p => {
      const price = vendorProducts.find(vp => vp._id.equals(p.vendorProduct)).price;
      return price * p.quantity;
    })
    .reduce((sum, curr) => sum + curr, 0);
  return Number(amount.toFixed(2));
};

const calculateProfit = async (order, merchantCost) => {
  console.log(order)
  // const vendorProductIds = arrayOfProducts.map(a => a.vendorProduct);
  // const vendorProducts = await VendorProduct.find({ _id: { $in: vendorProductIds } })
  //   .select('price productId')
  //   .populate({ path: 'productId', select: 'basePrice' });
  // console.log({ vendorProducts: vendorProducts[0] });
  // const profit = arrayOfProducts
  //   .map(p => {
  //     const product = vendorProducts.find(vp => vp._id.equals(p.vendorProduct));
  //     return (product.price - product.productId.basePrice) * p.quantity;
  //   })
  //   .reduce((sum, curr) => sum + curr, 0);
  const orderCost = order.tax * order.price
  const profit = order.totalAmount - (0.029 * order.totalAmount + 0.3) - orderCost - merchantCost.total;

  return Number(profit.toFixed(2));
};

module.exports = { calculateAmount, calculateProfit };
