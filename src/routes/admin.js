const express = require('express');
const router = express.Router();

const { Authenticate, Rbac } = require('../middleware');
const { FetchBestProfession, FetchBestClients } = require('../controllers/admin');

router.get('/best-profession', Authenticate, Rbac('admin'), FetchBestProfession);
router.get('/best-clients', Authenticate, Rbac('admin'), FetchBestClients);

module.exports = router;
