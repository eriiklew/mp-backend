const updateBalance = require('../jobs/moveBalanceFromEsrowToVendorWallet');

const cronJob = async (req, res) => {
  try {
    await updateBalance();

    res.status(200).json({ message: 'Executed cron job' });
  } catch (e) {
    console.log({ error: e.message });
  }
};

module.exports = {
  cronJob,
};
