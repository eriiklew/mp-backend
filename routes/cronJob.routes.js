const router = require('express').Router();
const { cronJob } = require('../controller/cronJob');

router.route('/').get(cronJob);

module.exports = router;
