// Simple console logger for Vercel deployment
// This replaces the Winston logger which can't write files in serverless environments

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Color codes for console output
const colors = {
  error: '\x1b[31m', // red
  warn: '\x1b[33m',  // yellow
  info: '\x1b[32m',  // green
  http: '\x1b[35m',  // magenta
  debug: '\x1b[37m', // white
  reset: '\x1b[0m'   // reset
};

// Get timestamp in a consistent format
const getTimestamp = () => {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

// Apply color to text
const colorize = (level, text) => {
  return `${colors[level]}${text}${colors.reset}`;
};

// Format message with timestamp and level
const formatMessage = (level, message) => {
  const timestamp = getTimestamp();
  return `${timestamp} ${colorize(level, level.toUpperCase())}: ${message}`;
};

// Main logger object
const logger = {
  error: (...args) => {
    console.error(formatMessage('error', args.join(' ')));
  },
  
  warn: (...args) => {
    console.warn(formatMessage('warn', args.join(' ')));
  },
  
  info: (...args) => {
    console.info(formatMessage('info', args.join(' ')));
  },
  
  http: (...args) => {
    console.log(formatMessage('http', args.join(' ')));
  },
  
  debug: (...args) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(formatMessage('debug', args.join(' ')));
    }
  },
  
  // Stream object for Morgan HTTP logging
  stream: {
    write: (message) => {
      logger.http(message.trim());
    },
  }
};

export default logger;