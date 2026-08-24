const express = require('express');
const router = express.Router();
const {
  createOfficerRole,
  listOfficerRoles,
  updateRolePermissions,
  assignRoleToUser
} = require('../controllers/roleController');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

router.use(authenticate);

router.post('/', requirePermission('role.manage'), validate(schemas.createOfficerRole), createOfficerRole);
router.get('/', requirePermission('role.manage'), listOfficerRoles);
router.put('/:id/permissions', requirePermission('role.manage'), validate(schemas.updateRolePermissions), updateRolePermissions);
router.post('/:id/assign', requirePermission('role.manage'), validate(schemas.assignRole), assignRoleToUser);

module.exports = router;
