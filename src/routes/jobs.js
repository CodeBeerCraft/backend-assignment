const express = require('express');
const sanitize = require('sanitize');
const router = express.Router();
router.use(sanitize.middleware);

const { Authenticate, Rbac } = require('../middleware');
const { Fetchjobs, PayForJob } = require('../controllers/jobs');

// Get Apis.
router.get('/unpaid', Authenticate, Fetchjobs);
router.post('/:job_id/pay', Authenticate, Rbac('client'), PayForJob);

module.exports = router;
