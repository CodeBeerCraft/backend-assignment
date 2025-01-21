const express = require('express');
const sanitize = require('sanitize');
const router = express.Router();
router.use(sanitize.middleware);

const { Authenticate, Rbac } = require('../middleware');
const { AddBalance } = require('../controllers/balance');

router.post('/deposit', Authenticate, Rbac('client'), AddBalance);

module.exports = router;
