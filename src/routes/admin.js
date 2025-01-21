const express = require('express');
const sanitize = require('sanitize');
const router = express.Router();
router.use(sanitize.middleware);

const { Authenticate, Rbac } = require('../middleware');
const { FetchBestProfession, FetchBestClients } = require('../controllers/admin');

router.get('/best-profession', Authenticate, Rbac('admin'), FetchBestProfession);
router.get('/best-clients', Authenticate, Rbac('admin'), FetchBestClients);

module.exports = router;
