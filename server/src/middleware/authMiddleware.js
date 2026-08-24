const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseFormatter');

const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'UNAUTHORIZED', 'Access token missing or invalid', 401);
    }

    const secret = process.env.JWT_SECRET || 'yarl_ventures_super_secret_jwt_key_2026_change_in_prod';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).populate('officerRoleId');
    if (!user) {
      return sendError(res, 'UNAUTHORIZED', 'User associated with token no longer exists', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'FORBIDDEN', 'User account is deactivated', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 'UNAUTHORIZED', 'Session expired or token invalid. Please log in again.', 401);
    }
    next(error);
  }
};

module.exports = { authenticate };
