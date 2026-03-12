/**
 * server.ts
 *
 * Application entry point.
 *
 * Boot order:
 *  1. Load environment variables (.env) — must happen first so every
 *     subsequent import already sees the correct values in process.env.
 *  2. Create the HTTP server wrapping the Express app.
 *  3. Attach Socket.IO to the same HTTP server (shared port).
 *  4. Register all Socket.IO event handlers.
 *  5. Connect to MongoDB; only start listening once the DB is ready.
 */

// ⚠️  env import must remain first — all other modules read process.env at load time
import './config/env';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/db';
import logger from './utils/logger';
import { initSocket } from './socket/index';

const PORT = process.env.PORT || 5000;

// Wrap the Express app in a Node.js HTTP server so Socket.IO can share the port
const server = http.createServer(app);

// Initialise Socket.IO with CORS settings that mirror the REST API
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Register all real-time event handlers (chat, code, whiteboard, rtc, proctor)
initSocket(io);

// Connect to MongoDB first; only bind the HTTP port on success.
// If the DB is unreachable we exit immediately so the process manager restarts.
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to database', err);
    process.exit(1); // non-recoverable — let systemd / Docker restart the container
  });
