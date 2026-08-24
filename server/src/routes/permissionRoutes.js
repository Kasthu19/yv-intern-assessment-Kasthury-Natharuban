const express = require('express');
const router = express.Router();
const { listPermissions } = require('../controllers/permissionController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, listPermissions);

module.exports = router;
