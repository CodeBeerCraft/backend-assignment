const express = require('express');
const sanitize = require('sanitize');
const router = express.Router();
router.use(sanitize.middleware);

const { Authenticate } = require('../middleware');
const { FetchProfile, LoginWithProfile, RegisterNewProfile } = require('../controllers/profiles');

// Open apis.
router.post('/login', LoginWithProfile);
router.post('/register', RegisterNewProfile);

// Get Apis.
router.get('/', Authenticate, FetchProfile); // Fetch Profile by logged in token.

module.exports = router;
