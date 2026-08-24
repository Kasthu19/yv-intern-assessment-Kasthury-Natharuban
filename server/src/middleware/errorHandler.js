const { sendError } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`API Error: ${err.message}`, { path: req.originalUrl, method: req.method });

  // Handle Mongoose Duplicate Key Error (e.g. unique email or role name)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(
      res,
      'DUPLICATE_KEY_ERROR',
      `A record with this ${field} already exists.`,
      409,
      [{ field, message: `${field} must be unique` }]
    );
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors).map(key => ({
      field: key,
      message: err.errors[key].message
    }));
    return sendError(res, 'VALIDATION_ERROR', 'Input validation failed', 400, details);
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
  }

  // Default Central Server Error (No raw stack trace exposed)
  return sendError(
    res,
    err.code || 'INTERNAL_SERVER_ERROR',
    err.message || 'An internal server error occurred',
    err.statusCode || 500
  );
};

module.exports = errorHandler;
