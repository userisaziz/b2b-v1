import mongoose from 'mongoose';
import logger from '../utils/consoleLogger.js';

/**
 * @desc    Get health status of the application
 * @route   GET /api/health
 * @access  Public
 */
export const getHealth = (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : dbState === 0 ? 'disconnected' : dbState === 2 ? 'connecting' : 'disconnecting';
    
    // Application info
    const uptime = process.uptime();
    const timestamp = new Date().toISOString();
    
    const healthCheck = {
      status: 'healthy',
      timestamp,
      uptime: `${Math.floor(uptime / 60)} minutes, ${Math.floor(uptime % 60)} seconds`,
      database: {
        status: dbStatus,
        connected: dbState === 1
      },
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    };

    // If database is not connected, return unhealthy status
    if (dbState !== 1) {
      healthCheck.status = 'unhealthy';
      logger.warn('Health check: Database not connected');
      return res.status(503).json(healthCheck);
    }

    logger.info('Health check successful');
    res.status(200).json(healthCheck);
  } catch (error) {
    logger.error('Health check failed:', error);
    const healthCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    };
    res.status(503).json(healthCheck);
  }
};