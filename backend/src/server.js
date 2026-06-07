"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ⚠️  env import must remain first — all other modules read process.env at load time
require("./config/env");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const logger_1 = __importDefault(require("./utils/logger"));
const index_1 = require("./sockets/index");
const PORT = process.env.PORT || 8090;
// Wrap the Express app in a Node.js HTTP server so Socket.IO can share the port
const server = http_1.default.createServer(app_1.default);
// Initialise Socket.IO with CORS settings that mirror the REST API
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:8080',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
// Register all real-time event handlers (chat, code, whiteboard, rtc, proctor)
(0, index_1.initSocket)(io);
// Connect to MongoDB first; only bind the HTTP port on success.
// If the DB is unreachable we exit immediately so the process manager restarts.
(0, db_1.connectDB)()
    .then(() => {
    server.listen(PORT, () => {
        logger_1.default.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
})
    .catch((err) => {
    logger_1.default.error('Failed to connect to database', err);
    process.exit(1); // non-recoverable — let systemd / Docker restart the container
});
