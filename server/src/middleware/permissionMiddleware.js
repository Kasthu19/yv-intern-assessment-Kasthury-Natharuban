const { sendError } = require('../utils/responseFormatter');
const { VALID_PERMISSIONS } = require('../models/OfficerRole');

/**
 * Returns the effective array of permission keys for a given user object.
 */
const getUserEffectivePermissions = (user) => {
  if (!user) return [];
  if (user.userType === 'CHAIRMAN') {
    return [...VALID_PERMISSIONS]; // Chairman holds full access to all permissions automatically (BR-05)
  }
  if (user.userType === 'OFFICER' && user.officerRoleId && Array.isArray(user.officerRoleId.permissions)) {
    return user.officerRoleId.permissions; // Officer has only granted role permissions (BR-06)
  }
  return []; // Members and visitors hold no staff permission keys
};

/**
 * Middleware factory that enforces a specific permission key.
 * @param {string} permissionKey - e.g. 'member.view', 'application.view', 'application.approve', etc.
 */
const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    // BR-05: Chairman bypasses all permission key checks
    if (req.user.userType === 'CHAIRMAN') {
      return next();
    }

    // Special rule BR-08: Only Chairman can perform role management tasks
    if (permissionKey === 'role.manage' && req.user.userType !== 'CHAIRMAN') {
      return sendError(res, 'FORBIDDEN', 'Only the Chairman can perform role management operations', 403);
    }

    // Check Officer permissions against assigned OfficerRole
    const effectivePermissions = getUserEffectivePermissions(req.user);
    if (effectivePermissions.includes(permissionKey)) {
      return next();
    }

    return sendError(
      res,
      'FORBIDDEN',
      `Permission denied. Missing required permission: '${permissionKey}'`,
      403
    );
  };
};

module.exports = {
  requirePermission,
  getUserEffectivePermissions
};
