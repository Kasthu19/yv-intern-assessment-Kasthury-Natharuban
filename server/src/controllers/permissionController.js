const { sendSuccess } = require('../utils/responseFormatter');

const PERMISSIONS_LIST = [
  { key: 'member.view', name: 'View Members', description: 'View member list and member details' },
  { key: 'application.view', name: 'View Applications', description: 'View membership applications' },
  { key: 'application.approve', name: 'Approve Applications', description: 'Approve a pending application' },
  { key: 'application.reject', name: 'Reject Applications', description: 'Reject a pending application' },
  { key: 'role.manage', name: 'Manage Roles', description: 'Create Officer Roles, change permissions, assign roles (Chairman only)' },
  { key: 'audit.view', name: 'View Audit Log', description: 'View system audit log history' }
];

const listPermissions = async (req, res, next) => {
  try {
    return sendSuccess(res, { permissions: PERMISSIONS_LIST });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPermissions,
  PERMISSIONS_LIST
};
