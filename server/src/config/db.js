"use strict";
/**
 * config/db.ts
 *
 * MongoDB connection helper.
 *
 * Mongoose maintains a connection pool internally, so `connectDB` only needs
 * to be called once at startup.  All models share the same default connection.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Establishes the MongoDB connection using the MONGODB_URI environment variable.
 * Exits the process with code 1 on failure so the process manager can restart.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI);
        logger_1.default.info(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        logger_1.default.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
