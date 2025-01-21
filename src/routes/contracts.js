const express = require('express');
const sanitize = require('sanitize');
const router = express.Router();
router.use(sanitize.middleware);

const { Authenticate, Rbac } = require('../middleware');

const { FetchContractById, FetchContracts, CreateContracts } = require('../controllers/contracts/');

// GET /contracts/:id - This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!
router.get('/:id', Authenticate, FetchContractById);

// GET /contracts - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.
router.get('/', Authenticate, FetchContracts);

// Create /contracts - Create contracts belonging between a client & a contractor.
router.post('/', Authenticate, Rbac('client'), CreateContracts);

module.exports = router;
