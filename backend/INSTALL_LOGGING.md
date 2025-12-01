# Installing Logging Dependencies

To enable the enhanced logging system, you need to install the following dependencies:

## Required Packages

1. **winston** - For structured logging
2. **morgan** - For HTTP request logging

## Installation Commands

Run these commands in the backend directory:

```bash
npm install winston morgan
```

## Environment Variables

Add the following to your `.env` file to configure the logging level:

```env
# Logging level (error, warn, info, http, debug)
LOG_LEVEL=debug
```

The default log level is `debug` which will log everything. For production, you might want to set it to `info` or `warn`.

## Log File Locations

After installation and running the application, log files will be created in the `logs/` directory:
- `combined.log` - Contains all log messages
- `error.log` - Contains only error-level messages

These files will be automatically rotated when they reach 5MB in size.