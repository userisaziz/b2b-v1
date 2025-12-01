// Global error handling middleware
import { sendInternalServerError } from '../utils/response.js';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  // Log the error with better formatting
  logger.error('Unhandled error occurred:', err, {
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  // Send a generic error response
  return sendInternalServerError(res, 'An unexpected error occurred');
};

export { errorHandler };