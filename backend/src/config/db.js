/**
 * config/db.ts
 *
 * MongoDB connection helper.
 *
 * Mongoose maintains a connection pool internally, so `connectDB` only needs
 * to be called once at startup.  All models share the same default connection.
 */
const mongoose = require("mongoose");
const logger = require("../utils/logger");
/**
 * Establishes the MongoDB connection using the MONGODB_URI environment variable.
 * Exits the process with code 1 on failure so the process manager can restart.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
