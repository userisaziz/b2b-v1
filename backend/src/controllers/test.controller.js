import logger from '../utils/logger.js';

// Test route to demonstrate error logging
const testError = (req, res) => {
  try {
    logger.info('Testing error logging...');
    
    // Simulate an error
    throw new Error('This is a test error to demonstrate improved logging');
  } catch (error) {
    logger.error('Test error caught:', error);
    res.status(500).json({
      success: false,
      message: 'Test error occurred',
      error: error.message
    });
  }
};

// Test route to demonstrate successful logging
const testSuccess = (req, res) => {
  logger.info('Test success route called', {
    query: req.query,
    params: req.params,
    body: req.body
  });
  
  res.json({
    success: true,
    message: 'Test successful',
    timestamp: new Date().toISOString()
  });
};

export { testError, testSuccess };