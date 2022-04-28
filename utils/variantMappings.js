const { productsConfig } = require('../constants/productMappings');

module.exports = function (products) {
  return products.map(product => {
    const labelledMappings = product.productMappings.map(pm => {
      return {
        ...pm,
        variant: { id: pm.variant.value, label: pm.variant.label || '' },
        color: { id: pm.color.value, label: pm.color.label || '' },
      };
    });

    const formattedproduct = {
      ...product,
      vendorProductId: product._id,
      productId: product.productId._id,
      name: product.productId.name,
      image: product.productId.image,
      slug: product.productId.slug,
      details: product.productId.details,
      backImage: product.productId.backImage,
    };

    delete formattedproduct._id;

    return formattedproduct;
  });
};
