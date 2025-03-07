const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Define log format
const logFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${message}`;
});

// Create logger with appropriate transports based on environment
const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // Write all logs with level 'error' and below to error.log
        new transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error' 
        }),
        
        // Write all logs to combined.log
        new transports.File({ 
            filename: path.join(logDir, 'combined.log') 
        })
    ]
});

// If we're not in production, also log to console with colors
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            logFormat
        )
    }));
}

module.exports = logger; 