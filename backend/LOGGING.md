# Backend Logging System

This document describes the enhanced logging system implemented for the backend.

## Overview

The logging system uses Winston for structured logging with the following features:
- Multiple log levels (error, warn, info, http, debug)
- Colored console output
- File logging with rotation
- HTTP request logging with Morgan
- Standardized log format

## Log Levels

1. **error** - Critical errors that need immediate attention
2. **warn** - Warning messages for potential issues
3. **info** - General information about application flow
4. **http** - HTTP request/response logging
5. **debug** - Detailed debugging information

## Log Files

Logs are stored in the `logs/` directory:
- `combined.log` - All log messages
- `error.log` - Only error-level messages

Files are rotated when they reach 5MB, with a maximum of 5 files retained.

## Usage

### In Controllers

```javascript
import logger from '../utils/logger.js';

// Log information
logger.info('User logged in successfully', { userId: user._id });

// Log warnings
logger.warn('Deprecated API endpoint accessed', { endpoint: req.path });

// Log errors
logger.error('Database connection failed', { error: err.message });

// Log debug information
logger.debug('Processing user data', { userData: req.body });
```

### HTTP Request Logging

All HTTP requests are automatically logged using Morgan middleware with our custom logger.

## Configuration

The log level can be controlled via the `LOG_LEVEL` environment variable:
- `error` - Only log errors
- `warn` - Log warnings and errors
- `info` - Log info, warnings, and errors (default)
- `http` - Log HTTP requests plus above
- `debug` - Log everything

## Example Log Output

```
2023-05-15 14:30:22 info: User logged in successfully
2023-05-15 14:30:25 http: ::1 - - [15/May/2023:12:30:25 +0000] "GET /api/users HTTP/1.1" 200 1234 "-" "Mozilla/5.0..."
2023-05-15 14:30:30 debug: Processing user data { userData: { name: 'John', email: 'john@example.com' } }
```

## Testing

To test the logging system, you can make requests to:
- `GET /api/logging-example/example` - Basic logging example
- `GET /api/logging-example/another-example` - Advanced logging example
- `GET /api/logging-example/another-example?fail=true` - Error logging example

## Adding Logging to Existing Code

To add logging to existing controllers:

1. Import the logger:
   ```javascript
   import logger from '../utils/logger.js';
   ```

2. Replace `console.log` statements with appropriate logger calls:
   ```javascript
   // Before
   console.log('User authenticated');
   
   // After
   logger.info('User authenticated');
   ```

3. Use structured logging for complex data:
   ```javascript
   logger.info('User action performed', {
     userId: user._id,
     action: 'product_created',
     productId: product._id
   });
   ```