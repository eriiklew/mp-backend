const router = require('express').Router();
const {
  getVendorInfo,
  matchPassword,
  updatePassword,
  updateName,
} = require('../controller/vendor');
const auth = require('../middleware/auth');

router.route('/profile').get(auth, getVendorInfo);
router.route('/profile/match-password').post(auth, matchPassword);
router.route('/profile/update-password').post(auth, updatePassword);
router.route('/profile/update-name').post(auth, updateName);

module.exports = router;
