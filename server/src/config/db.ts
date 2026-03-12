/**
 * config/db.ts
 *
 * MongoDB connection helper.
 *
 * Mongoose maintains a connection pool internally, so `connectDB` only needs
 * to be called once at startup.  All models share the same default connection.
 */

import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Establishes the MongoDB connection using the MONGODB_URI environment variable.
 * Exits the process with code 1 on failure so the process manager can restart.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};
