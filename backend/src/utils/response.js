// Utility functions for consistent API responses
const sendResponse = (res, statusCode, success, data = null, message = '') => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

const sendSuccess = (res, data = null, message = 'Request successful') => {
  return sendResponse(res, 200, true, data, message);
};

const sendCreated = (res, data = null, message = 'Resource created successfully') => {
  return sendResponse(res, 201, true, data, message);
};

const sendError = (res, statusCode, message = 'An error occurred') => {
  return sendResponse(res, statusCode, false, null, message);
};

const sendBadRequest = (res, message = 'Bad request') => {
  return sendError(res, 400, message);
};

const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(res, 401, message);
};

const sendForbidden = (res, message = 'Access forbidden') => {
  return sendError(res, 403, message);
};

const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, 404, message);
};

const sendInternalServerError = (res, message = 'Internal server error') => {
  return sendError(res, 500, message);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendCreated,
  sendError,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendInternalServerError
};