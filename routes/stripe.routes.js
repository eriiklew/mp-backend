const router = require('express').Router();
const {
  createAccount,
  getAccountInfo,
  payout,
  getTransactionHistory,
  getAccountDashboardLink,
  getPendingBalance,
  getEscrowTransactions,
  deleteAccount,
} = require('../controller/stripe');
const auth = require('../middleware/auth');

router.route('/account').post(auth, createAccount);
router.route('/account').get(auth, getAccountInfo);
router.route('/delete').delete(auth, deleteAccount);
router.route('/payout').post(auth, payout);
router.route('/history').get(auth, getTransactionHistory);
router.route('/account/dashboard').get(auth, getAccountDashboardLink);
router.route('/pending-balance').get(auth, getPendingBalance);
router.route('/escrow-transactions').get(auth, getEscrowTransactions);

module.exports = router;
