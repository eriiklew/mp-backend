const mapColor = function (order) {
  const updatedProducts = order.products.map(product => {
    console.log({ mappings: product.productMapping });
    // const relatedConfig = productsConfig[product.vendorProduct.productId.slug];

    const labelledMapping = {
      ...product.productMapping,
      variant: {
        id: product.productMapping.variant.value,
        label: product.productMapping.variant.label || '',
      },
      color: {
        id: product.productMapping.color.value,
        label: product.productMapping.color.label || '',
      },
    };

    return {
      ...product,
      productMapping: labelledMapping,
    };
  });

  return {
    ...order,
    products: updatedProducts,
  };
};
module.exports = {
  mapColor,
};
