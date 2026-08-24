const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getUserEffectivePermissions } = require('../middleware/permissionMiddleware');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'yarl_ventures_super_secret_jwt_key_2026_change_in_prod';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign(
    { id: user._id, email: user.email, userType: user.userType },
    secret,
    { expiresIn }
  );
};

const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'DUPLICATE_KEY_ERROR', 'A user with this email address already exists', 409, [
        { field: 'email', message: 'Email address is already registered' }
      ]);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      userType: 'MEMBER'
    });

    const token = generateToken(user);
    const effectivePermissions = getUserEffectivePermissions(user);

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          userType: user.userType,
          effectivePermissions
        }
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash').populate('officerRoleId');
    if (!user) {
      return sendError(res, 'UNAUTHORIZED', 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'UNAUTHORIZED', 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'FORBIDDEN', 'Your account has been deactivated', 403);
    }

    const token = generateToken(user);
    const effectivePermissions = getUserEffectivePermissions(user);

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          userType: user.userType,
          officerRole: user.officerRoleId ? { id: user.officerRoleId._id, name: user.officerRoleId.name } : null,
          effectivePermissions
        }
      },
      'Login successful',
      200
    );
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    const effectivePermissions = getUserEffectivePermissions(user);

    return sendSuccess(res, {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        officerRole: user.officerRoleId ? { id: user.officerRoleId._id, name: user.officerRoleId.name } : null,
        effectivePermissions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
