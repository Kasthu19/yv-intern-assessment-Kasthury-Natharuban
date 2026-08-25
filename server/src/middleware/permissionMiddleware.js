const { sendError } = require('../utils/responseFormatter');
const { VALID_PERMISSIONS } = require('../models/OfficerRole');



const getUserEffectivePermissions = (user) => {
  if (!user) return [];
  if (user.userType === 'CHAIRMAN') {
    return [...VALID_PERMISSIONS]; 
  }
  if (user.userType === 'OFFICER' && user.officerRoleId && Array.isArray(user.officerRoleId.permissions)) {
    return user.officerRoleId.permissions; 
  }
  return []; 
};

 
const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    
    if (req.user.userType === 'CHAIRMAN') {
      return next();
    }

  
    if (permissionKey === 'role.manage' && req.user.userType !== 'CHAIRMAN') {
      return sendError(res, 'FORBIDDEN', 'Only the Chairman can perform role management operations', 403);
    }

   
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
