const OfficerRole = require('../models/OfficerRole');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

/**
 * Create an Officer Role (F-10, BR-08, requires 'role.manage', Chairman only)
 */
const createOfficerRole = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;
    const actorId = req.user._id;

    const existingRole = await OfficerRole.findOne({ name });
    if (existingRole) {
      return sendError(res, 'DUPLICATE_KEY_ERROR', `Role with name '${name}' already exists`, 409);
    }

    const role = await OfficerRole.create({
      name,
      description,
      permissions: permissions || [],
      createdBy: actorId
    });

    // Audit Log (BR-09)
    await AuditLog.create({
      actorUserId: actorId,
      action: 'ROLE_CREATED',
      entityType: 'OfficerRole',
      entityId: role._id,
      details: {
        roleName: role.name,
        permissions: role.permissions
      },
      ipAddress: req.ip || req.connection.remoteAddress
    });

    return sendSuccess(res, { role }, 'Officer Role created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * List all Officer Roles
 */
const listOfficerRoles = async (req, res, next) => {
  try {
    const roles = await OfficerRole.find().sort({ createdAt: -1 }).populate('createdBy', 'fullName email');
    return sendSuccess(res, { roles });
  } catch (error) {
    next(error);
  }
};

/**
 * Update role permissions (BR-08, requires 'role.manage', Chairman only)
 */
const updateRolePermissions = async (req, res, next) => {
  try {
    const roleId = req.params.id;
    const { permissions } = req.body;
    const actorId = req.user._id;

    const role = await OfficerRole.findById(roleId);
    if (!role) {
      return sendError(res, 'NOT_FOUND', 'Officer Role not found', 404);
    }

    const oldPermissions = [...role.permissions];
    role.permissions = permissions;
    await role.save();

    // Audit Log (BR-09)
    await AuditLog.create({
      actorUserId: actorId,
      action: 'ROLE_PERMISSIONS_CHANGED',
      entityType: 'OfficerRole',
      entityId: role._id,
      details: {
        roleName: role.name,
        oldPermissions,
        newPermissions: permissions
      },
      ipAddress: req.ip || req.connection.remoteAddress
    });

    return sendSuccess(res, { role }, 'Role permissions updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Assign Officer Role to a user (F-11, BR-08, requires 'role.manage', Chairman only)
 */
const assignRoleToUser = async (req, res, next) => {
  try {
    const roleId = req.params.id;
    const { userId } = req.body;
    const actorId = req.user._id;

    const role = await OfficerRole.findById(roleId);
    if (!role) {
      return sendError(res, 'NOT_FOUND', 'Officer Role not found', 404);
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return sendError(res, 'NOT_FOUND', 'Target user not found', 404);
    }

    if (targetUser.userType === 'CHAIRMAN') {
      return sendError(res, 'BAD_REQUEST', 'Cannot assign Officer Role to Chairman account', 400);
    }

    const previousRole = targetUser.officerRoleId;
    targetUser.officerRoleId = role._id;
    targetUser.userType = 'OFFICER'; // Switch userType to OFFICER
    await targetUser.save();

    // Audit Log (BR-09)
    await AuditLog.create({
      actorUserId: actorId,
      action: 'ROLE_ASSIGNED',
      entityType: 'User',
      entityId: targetUser._id,
      details: {
        assignedToEmail: targetUser.email,
        assignedToName: targetUser.fullName,
        roleName: role.name,
        previousRoleId: previousRole
      },
      ipAddress: req.ip || req.connection.remoteAddress
    });

    return sendSuccess(
      res,
      {
        user: {
          id: targetUser._id,
          fullName: targetUser.fullName,
          email: targetUser.email,
          userType: targetUser.userType,
          officerRole: { id: role._id, name: role.name }
        }
      },
      `Assigned role '${role.name}' to user '${targetUser.fullName}' successfully`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOfficerRole,
  listOfficerRoles,
  updateRolePermissions,
  assignRoleToUser
};
