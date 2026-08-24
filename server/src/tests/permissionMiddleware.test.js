const { requirePermission, getUserEffectivePermissions } = require('../middleware/permissionMiddleware');

describe('Permission Middleware Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  test('Should return 401 if user is not attached to request', () => {
    const middleware = requirePermission('application.view');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' })
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('Should allow CHAIRMAN full access without needing permission keys (BR-05)', () => {
    req.user = {
      userType: 'CHAIRMAN',
      officerRoleId: null
    };

    const middleware = requirePermission('any.random.permission');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('Should allow OFFICER with matching permission key', () => {
    req.user = {
      userType: 'OFFICER',
      officerRoleId: {
        permissions: ['application.view', 'application.approve']
      }
    };

    const middleware = requirePermission('application.approve');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('Should return 403 HTTP status when OFFICER is missing required permission key', () => {
    req.user = {
      userType: 'OFFICER',
      officerRoleId: {
        permissions: ['application.view']
      }
    };

    const middleware = requirePermission('audit.view');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'FORBIDDEN',
          message: expect.stringContaining("Missing required permission: 'audit.view'")
        })
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('Should restrict role.manage to Chairman only (BR-08)', () => {
    req.user = {
      userType: 'OFFICER',
      officerRoleId: {
        permissions: ['role.manage'] // even if present in officer permissions array
      }
    };

    const middleware = requirePermission('role.manage');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'FORBIDDEN',
          message: 'Only the Chairman can perform role management operations'
        })
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('getUserEffectivePermissions helper should return all keys for CHAIRMAN and empty for MEMBER', () => {
    const chairmanUser = { userType: 'CHAIRMAN' };
    const memberUser = { userType: 'MEMBER' };
    const officerUser = {
      userType: 'OFFICER',
      officerRoleId: { permissions: ['member.view'] }
    };

    expect(getUserEffectivePermissions(chairmanUser).length).toBe(6);
    expect(getUserEffectivePermissions(memberUser)).toEqual([]);
    expect(getUserEffectivePermissions(officerUser)).toEqual(['member.view']);
  });
});
