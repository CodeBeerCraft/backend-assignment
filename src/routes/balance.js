const express = require('express');
const router = express.Router();

const { Authenticate, Rbac } = require('../middleware');
const { AddBalance } = require('../controllers/balance');

router.post('/deposit', Authenticate, Rbac('client'), AddBalance);

module.exports = router;
