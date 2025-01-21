const express = require('express');
const router = express.Router();

const { Authenticate, Rbac } = require('../middleware');

const {
  FetchContractById,
  FetchContracts,
  CreateContracts,
  StartJob,
} = require('../controllers/contracts/');

// GET /contracts/:id - This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!
router.get('/:id', Authenticate, FetchContractById);

// GET /contracts - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.
router.get('/', Authenticate, FetchContracts);

// Create /contracts - Create contracts belonging between a client & a contractor.
router.post('/', Authenticate, Rbac('client'), CreateContracts);

// Start the job : Changes status from new to in_progress
router.post('/:contractId', Authenticate, Rbac('contractor'), StartJob);

module.exports = router;
