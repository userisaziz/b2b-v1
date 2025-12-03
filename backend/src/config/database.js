import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    logger.info("Attempting MongoDB connection...");
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    
    // Connection options
    const options = {};
    
    // Add production-specific options for better reliability in serverless environments
    if (process.env.NODE_ENV === 'production') {
      options.serverSelectionTimeoutMS = 5000;
      options.socketTimeoutMS = 45000;
      options.maxPoolSize = 10;
      options.retryWrites = true;
      options.retryReads = true;
      options.directConnection = false;
    }
    
    await mongoose.connect(process.env.MONGO_URI, options);
    logger.info("✅ MongoDB Connected");
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
  } catch (error) {
    logger.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;