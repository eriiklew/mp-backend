const Escrow = require('../models/escrow');
const Vendor = require('../models/vendor');
const moment = require('moment');

const updateBalance = async function () {
  try {
    const escrowsWithTodayRelease = await Escrow.find({
      status: 'pending',
      releaseDate: {
        // $gte: moment().utc().startOf('day'),
        $lte: moment().utc().endOf('day'),
      },
    }).limit(3);

    for (var i in escrowsWithTodayRelease) {
      const escrow = escrowsWithTodayRelease[i];
      const vendor = await Vendor.findById(escrow.vendorId);

      vendor.balance = Number(
        (vendor.balance + escrow.vendorProfit).toFixed(2),
      );

      await vendor.save();

      escrow.status = 'released';
      await escrow.save();
    }
  } catch (e) {
    console.log({ error: e.message });
  }
};

module.exports = updateBalance;
