const router = require('express').Router();
const { addContact } = require('../controller/contact');
const auth = require('../middleware/auth');

router.route('/').post(addContact);

module.exports = router;
