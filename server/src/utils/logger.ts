/**
 * utils/logger.ts
 *
 * Centralised Winston logger instance.
 *
 * All application code should import this logger instead of using
 * console.log/error so that log output is consistent and can be
 * redirected to a file or external service by adding transports here.
 *
 * Current transports:
 *  - Console: colourised simple format (useful for local development)
 *
 * To add file or cloud logging, push additional transports into the
 * `transports` array (e.g. winston-daily-rotate-file, winston-cloudwatch).
 */

import winston from 'winston';

const logger = winston.createLogger({
  // Default log level — messages below this severity are ignored.
  // Override per-environment by setting LOG_LEVEL in .env.
  level: process.env.LOG_LEVEL || 'info',

  // Global format applied before each transport’s own format:
  //  1. Prepend ISO timestamp
  //  2. Include stack trace when an Error object is logged
  //  3. Serialise as JSON (structured logging for production)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  transports: [
    // Console transport — colourised + single-line format for readability
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export default logger;