const express = require('express');
const router = express.Router();
const { getMembershipTypes } = require('../controllers/membershipTypeController');

router.get('/', getMembershipTypes);

module.exports = router;
