/**
 * Utility functions for standard API response shape
 * Success: { success: true, data: { ... }, message: "..." }
 * Error:   { success: false, error: { code: "...", message: "...", details: [ ... ] } }
 */

const sendSuccess = (res, data = {}, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

const sendError = (res, code = 'INTERNAL_SERVER_ERROR', message = 'An error occurred', statusCode = 500, details = []) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    }
  });
};

module.exports = {
  sendSuccess,
  sendError
};
