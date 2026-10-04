/**
 * Logger Configuration
 * 
 * Winston-based structured logging with multiple transports.
 * Logs to console (dev) and files (all environments).
 */

import winston from 'winston'
import config from './env'
import path from 'path'
import fs from 'fs'

// Ensure logs directory exists
const logsDir = path.dirname(config.logging.errorFile)
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, requestId, ...metadata }) => {
    let msg = `${timestamp} [${level}]`;
    
    // Add request ID if present
    if (requestId) {
      msg += ` [${requestId}]`;
    }
    
    msg += `: ${message}`;
    
    // Add metadata if present (excluding requestId as it's already shown)
    const otherMetadata = { ...metadata };
    delete otherMetadata.service;
    delete otherMetadata.environment;
    
    if (Object.keys(otherMetadata).length > 0) {
      msg += ` ${JSON.stringify(otherMetadata, null, 2)}`;
    }
    
    return msg;
  })
);

// Format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Create Winston logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: fileFormat,
  defaultMeta: {
    service: 'agrimarket-api',
    environment: config.nodeEnv,
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: config.logging.errorFile,
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: config.logging.combinedFile,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
    }),
  ],
})

// Add console transport in development
if (config.isDevelopment) {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  )
}

// Add console transport in production for critical errors
if (config.isProduction) {
  logger.add(
    new winston.transports.Console({
      level: 'error',
      format: consoleFormat,
    })
  )
}

// Create a stream for Morgan HTTP logger
export const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}

/**
 * Create a child logger with request ID context
 * @param requestId The request ID to include in all log entries
 */
export const createRequestLogger = (requestId: string) => {
  return logger.child({ requestId });
};

export default logger
