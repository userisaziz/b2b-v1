import logger from '../utils/logger.js';

// Example controller to demonstrate logging
export const exampleController = async (req, res) => {
  try {
    logger.info('Example controller called with params:', req.params);
    logger.debug('Request body:', req.body);
    
    // Simulate some processing
    const result = {
      message: 'This is an example response',
      timestamp: new Date().toISOString(),
    };
    
    logger.info('Example controller processed successfully');
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error in example controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Another example with different log levels
export const anotherExample = async (req, res) => {
  try {
    logger.info('Another example controller called');
    
    // Log a warning
    if (!req.query.id) {
      logger.warn('No ID provided in query parameters');
    }
    
    // Log some debug information
    logger.debug('Headers:', req.headers);
    logger.debug('Query params:', req.query);
    
    // Simulate an operation that might fail
    if (req.query.fail) {
      throw new Error('Simulated error for demonstration');
    }
    
    logger.info('Another example controller completed successfully');
    res.status(200).json({
      success: true,
      message: 'Operation completed',
    });
  } catch (error) {
    logger.error('Error in another example controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};