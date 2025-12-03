// Conditional logger that uses console logger for Vercel and Winston for local development
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';
import fs from 'fs';

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define custom colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Set the colors
winston.addColors(colors);

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom formatter for console logs with better error formatting
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let formattedMessage = `${timestamp} ${level}: ${message}`;

    // If there's a stack trace, format it nicely
    if (stack) {
      formattedMessage += `\n${stack}`;
    }

    // If there's metadata, format it nicely
    if (Object.keys(meta).length > 0) {
      formattedMessage += `\n${util.inspect(meta, { colors: true, depth: 4, compact: false })}`;
    }

    return formattedMessage;
  })
);

// Custom formatter for file logs with better error formatting
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let formattedMessage = `${timestamp} ${level}: ${message}`;

    // If there's a stack trace, include it
    if (stack) {
      formattedMessage += `\n${stack}`;
    }

    // If there's metadata, include it
    if (Object.keys(meta).length > 0) {
      formattedMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return formattedMessage;
  })
);

// Create the logger with Winston by default
let logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  transports: [
    // Console transport with enhanced formatting
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Add file transports only if not using console-only mode
if (process.env.USE_CONSOLE_LOGGER !== 'true') {
  logger.configure({
    level: process.env.LOG_LEVEL || 'debug',
    levels,
    transports: [
      // Console transport with enhanced formatting
      new winston.transports.Console({
        format: consoleFormat,
      }),

      // File transport for all logs
      new winston.transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),

      // File transport for error logs
      new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    ],
  });
}

// Create a stream object for Morgan (HTTP logging)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Enhance the error logging function
const originalError = logger.error;
logger.error = function(...args) {
  // If the first argument is an Error object, extract its properties
  if (args[0] instanceof Error) {
    const error = args[0];
    const meta = args.slice(1);
    return originalError.call(this, error.message, { stack: error.stack, ...meta });
  }

  // If it's a string followed by an Error object
  if (typeof args[0] === 'string' && args[1] instanceof Error) {
    const message = args[0];
    const error = args[1];
    const meta = args.slice(2);
    return originalError.call(this, message, { stack: error.stack, ...meta });
  }

  // Otherwise, use the original function
  return originalError.apply(this, args);
};

export default logger;