const express = require('express');
const router = express.Router();

const { Authenticate, Rbac } = require('../middleware');
const { Fetchjobs, PayForJob } = require('../controllers/jobs');

// Get Apis.
router.get('/unpaid', Authenticate, Fetchjobs);
router.post('/:job_id/pay', Authenticate, Rbac('client'), PayForJob);

module.exports = router;
