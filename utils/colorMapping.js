const { productsConfig } = require('../constants/productMappings');

module.exports = function (products) {
  // console.log(products[0]);
  return products.map(product => {
    let labelledColors = [];
    const relatedProductVariants = product.productMappings.filter(p =>
      p.productId.equals(product._id),
    );

    labelledColors = product.colors.map(pm => ({
      id: pm.value,
      label: pm.label,
      relatedProductVariantsId: relatedProductVariants.filter(p => p.color.value === pm.value),
    }));

    return { ...product, colors: labelledColors };
  });
};