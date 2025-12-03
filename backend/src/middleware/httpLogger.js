import morgan from 'morgan';
import logger from '../utils/consoleLogger.js';

// Custom format for HTTP logging with better readability
const httpFormat = ':method :url :status :response-time ms - :res[content-length] bytes [:date[clf]]';

// Create the HTTP logger middleware with enhanced formatting
const httpLogger = morgan(httpFormat, {
  stream: logger.stream,
  skip: (req, res) => {
    // Skip logging health check endpoints to reduce noise
    if (req.url === '/health' || req.url === '/api/health') {
      return true;
    }
    return false;
  }
});

export default httpLogger;