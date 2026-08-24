const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplicationStatus,
  listApplications,
  approveApplication,
  rejectApplication
} = require('../controllers/applicationController');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

router.post('/', authenticate, validate(schemas.submitApplication), submitApplication);
router.get('/my-status', authenticate, getMyApplicationStatus);
router.get('/', authenticate, requirePermission('application.view'), listApplications);
router.patch('/:id/approve', authenticate, requirePermission('application.approve'), approveApplication);
router.patch('/:id/reject', authenticate, requirePermission('application.reject'), validate(schemas.rejectApplication), rejectApplication);

module.exports = router;
