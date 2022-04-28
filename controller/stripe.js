const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const VendorStripInfo = require('../models/vendorStripInfo');
const Transaction = require('../models/transaction');
const Escrow = require('../models/escrow');
const Vendor = require('../models/vendor');

const createAccount = async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      country: 'US',
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      // business_profile: { url: process.env.STRIPE_CONNECT_REDIRECT_URL },
    });
    console.log({ userData: req.userData });
    console.log({ accountId: account.id });
    const vendorStripe = await VendorStripInfo.create({
      vendorId: req.userData.vendorId,
      stripeAccountId: account.id,
    });
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.STRIPE_CONNECT_REDIRECT_URL}`,
      return_url: `${process.env.STRIPE_CONNECT_REDIRECT_URL}`,
      type: 'account_onboarding',
    });

    res.status(200).json({
      url: accountLink.url,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.log('createAccount', error.message);
    res.status(400).json({ message: error.message });
  }
};

const getAccountInfo = async (req, res) => {
  try {
    let account;
    const vendorStripe = await VendorStripInfo.findOne({
      vendorId: req.userData.vendorId,
    });

    console.log({ vendorStripe });
    if (vendorStripe) {
      account = await stripe.accounts.retrieve(vendorStripe.stripeAccountId);
    }

    res.status(200).json({ account });
  } catch (error) {
    console.log('getAccountInfo', error.message);
    res.status(400).json({ message: error.message });
  }
};

// const payout = async (req, res) => {
//   try {
//     const transaction = await Transaction.initiatePayout(req.userData.vendorId);
//     const transfer = await stripe.transfers.create({
//       amount: transaction.totalPayout * 100,
//       currency: 'usd',
//       destination: transaction.stripeAccountId,
//     });

//     await Transaction.updatePayout(transaction, transfer);

//     const vendorHistory = await Transaction.transactionHistory(
//       req.userData.vendorId,
//     );

//     res.status(200).json({
//       vendorHistory,
//       message: 'Payment successfully transferred!',
//     });
//   } catch (error) {
//     console.log('payout', error.message);
//     res.status(400).json({ message: error.message });
//   }
// };

const payout = async (req, res) => {
  try {
    const transaction = await Transaction.initiatePayout(req.userData.vendorId);
    try {
      const transfer = await stripe.transfers.create({
        amount: transaction.totalPayout * 100,
        currency: 'usd',
        destination: transaction.stripeAccountId,
      });

      await Transaction.handleSuccessfulPayout(transaction);

      const vendorHistory = await Transaction.transactionHistory(req.userData.vendorId);

      res.status(200).json({
        vendorHistory,
        message: 'Payment successfully transferred!',
      });
    } catch (error) {
      await Transaction.handleFailedPayout(transaction);
      console.log('payout', error.message);
      res.status(400).json({ message: error.message });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const vendorHistory = await Transaction.transactionHistory(req.userData.vendorId);

    res.status(200).json({ vendorHistory });
  } catch (error) {
    console.log('payout', error.message);
    res.status(400).json({ message: error.message });
  }
};

const getAccountDashboardLink = async (req, res) => {
  try {
    console.log('Running');
    const vendorStripe = await VendorStripInfo.findOne({
      vendorId: req.userData.vendorId,
    });

    const link = await stripe.accounts.createLoginLink(vendorStripe.stripeAccountId);

    res.status(200).json({ link });
  } catch (error) {
    console.log('express acoount dashboard: ', error.message);
    res.status(400).json({ message: error.message });
  }
};

const getPendingBalance = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      userId: req.userData._id,
    });

    const balanceData = await Escrow.calculatePendingEscrowsForVendor(vendor._id);

    res.status(200).json({
      balanceData,
      message: 'Pending balance fetched successfully',
    });
  } catch (error) {
    console.log('get pending balance controller', error);
    res.status(400).json({ message: error.message });
  }
};

const getEscrowTransactions = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      userId: req.userData._id,
    });

    const transactions = await Escrow.getEscrowTransactions(vendor._id);

    res.status(200).json({ transactions });
  } catch (error) {
    console.log('get pending balance controller', error);
    res.status(400).json({ message: error.message });
  }
};
const deleteAccount = async (req, res) => {
  try {
    const vendorStripe = await VendorStripInfo.deleteOne({ vendorId: req.userData.vendorId });
    res.status(200).json(vendorStripe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = {
  createAccount,
  getAccountInfo,
  payout,
  getTransactionHistory,
  getAccountDashboardLink,
  getPendingBalance,
  getEscrowTransactions,
  deleteAccount,
};
