const express = require('express');
const sanitize = require('sanitize');
const router = express.Router();
router.use(sanitize.middleware);

const { Authenticate } = require('../middleware');

const { FetchContractById } = require('../controllers/contracts/');

router.get('/:contract_id', Authenticate, FetchContractById);

module.exports = router;
