const axios = require('axios');
const PRINTFUL_API = 'https://api.printful.com';
const { calculateAmount } = require('./calculateAmount');

const printfulTax = async data => {
  try {
    const country = data.recipient.country_code;
    const regionResponse = await axios.get(`https://restcountries.com/v3.1/alpha/${country}`);

    console.log(country)
    if (country === 'US') {
      return {
        rate: 0.1085,
        shipping_taxable: true,
      };
    }
    if (country === 'AU') {
      return {
        rate: 0.1,
        shipping_taxable: true,
      };
    }

    if (country === 'NZ') {
      return {
        rate: 0.15,
        shipping_taxable: true,
      };
    }

    if (country === 'NO') {
      return {
        rate: 0.25,
        shipping_taxable: true,
      };
    }

    if (country === 'JP') {
      return {
        rate: 0.1,
        shipping_taxable: true,
      };
    }

    if (country === 'CA') {
      return {
        rate: 0.15,
        shipping_taxable: true,
      };
    }

    if (regionResponse.data[0].region === 'Europe') {
      return {
        rate: 0.2,
        shipping_taxable: true,
      };
    }

    else {
      return {
        rate: .05,
        shipping_taxable: true,
      }
    }
    // const res = await axios.post(`${PRINTFUL_API}/tax/rates`, data, {
    //   headers: {
    //     authorization: `Basic ${process.env.PRINTFUL_API_KEY}`,
    //   },
    // });

    // return res.data.result;
  } catch (e) {
    return {
      code: e.response.data.code,
      message: e.response.data.result,
    };
  }
};

const printfulShipping = async data => {
  try {
    if (data.recipient.country_code === 'US') {
      return {
        rate: 'FREE',
        shipping_taxable: false,
      };
    }

    const res = await axios.post(`${PRINTFUL_API}/shipping/rates`, data, {
      headers: {
        authorization: `Basic ${process.env.PRINTFUL_API_KEY}`,
      },
    });

    // console.log(`printful shipping data ${res.data}`)
    return res.data.result[0];
  } catch (e) {
    return {
      code: e.response.data.code,
      messagen: e.response.data.result,
    };
  }
};

const printfulOrder = async data => {
  try {
    const res = await axios.post(`${PRINTFUL_API}/orders`, data, {
      headers: {
        authorization: `Basic ${process.env.PRINTFUL_API_KEY}`,
      },
    });

    return res.data.result;
  } catch (e) {
    return {
      code: e.response.data.code,
      message: e.response.data.result,
    };
  }
};

const priceCalculation = async data => {
  try {
    let taxAmount = 0;
    let shippingAmount = 0;
    let orderActualAmount = 0;
    let amountWithTaxAndShipping = 0;

    let orderShipping
    let orderTax
    /**
     * Keep the printfulTax call as the first to execute
     * because it will validate data plus country & state as well
     */

    const taxResponse = await printfulTax(data);
    console.log(taxResponse)

    if (taxResponse.code === 400) {
      throw new Error(taxResponse.message);
    }
    const shippingResponse = await printfulShipping(data);
    console.log(shippingResponse)
    orderActualAmount = await calculateAmount(data.items);
    shippingAmount = shippingResponse.rate === 'FREE' ? Number('0') : Number(shippingResponse.rate);
    taxAmount = Number(((orderActualAmount + shippingAmount) * Number(taxResponse.rate)).toFixed(2));
    amountWithTaxAndShipping = Number((orderActualAmount + shippingAmount + taxAmount).toFixed(2));
    console.log(amountWithTaxAndShipping)
    return {
      taxRate: taxResponse.rate,
      shippingAmount: shippingResponse.rate,
      taxAmount,
      orderActualAmount,
      amountWithTaxAndShipping,
    };
  } catch (e) {
    return {
      code: 400,
      message: e.message,
    };
  }
};

module.exports = {
  printfulOrder,
  priceCalculation,
};
