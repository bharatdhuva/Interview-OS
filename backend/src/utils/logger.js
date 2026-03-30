"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    // Default log level — messages below this severity are ignored.
    // Override per-environment by setting LOG_LEVEL in .env.
    level: process.env.LOG_LEVEL || 'info',
    // Global format applied before each transport’s own format:
    //  1. Prepend ISO timestamp
    //  2. Include stack trace when an Error object is logged
    //  3. Serialise as JSON (structured logging for production)
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    transports: [
        // Console transport — colourised + single-line format for readability
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
        }),
    ],
});
exports.default = logger;
