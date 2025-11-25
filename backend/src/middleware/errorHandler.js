// Global error handling middleware
const { sendInternalServerError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Send a generic error response
  return sendInternalServerError(res, 'An unexpected error occurred');
};

module.exports = {
  errorHandler
};