const express = require('express');
const sanitize = require('sanitize');
const router = express.Router();
router.use(sanitize.middleware);

const { FetchContractById } = require('../controllers/contracts/');

router.get('/:contract_id', FetchContractById);

module.exports = router;
