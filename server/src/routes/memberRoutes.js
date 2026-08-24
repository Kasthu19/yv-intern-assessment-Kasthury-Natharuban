const express = require('express');
const router = express.Router();
const { listMembers, exportMembersCSV } = require('../controllers/memberController');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

router.get('/', authenticate, requirePermission('member.view'), listMembers);
router.get('/export/csv', authenticate, requirePermission('member.view'), exportMembersCSV);

module.exports = router;
