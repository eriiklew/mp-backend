const { productsConfig } = require('../constants/productMappings');

module.exports = function (product) {
  // console.log("proso dp", product);
  // const relatedConfig = productsConfig[product.slug];
  const labelledMappings = product.productMappings.map(pm => {
    return {
      ...pm,
      variant: { id: pm.variant.value, label: pm.variant.label || '' },
      color: { id: pm.color.value, label: pm.color.label || '' },
    };
  });

  return { ...product, productMappings: labelledMappings };
};
