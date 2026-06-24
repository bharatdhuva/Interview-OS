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
require("./config/env");
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app");
const db = require("./config/db");
const logger = require("./utils/logger");
const index = require("./sockets/index");
const PORT = process.env.PORT || 8090;
// Wrap the Express app in a Node.js HTTP server so Socket.IO can share the port
const server = http.createServer(app);
// Initialise Socket.IO with CORS settings that mirror the REST API
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
].filter(Boolean);

const io = new socketIo.Server(server, {
    maxHttpBufferSize: parseInt(process.env.SOCKET_MAX_HTTP_BUFFER_SIZE || '10485760', 10),
    cors: {
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }
            const isAllowed = allowedOrigins.includes(origin) || 
                (process.env.NODE_ENV === 'production' && origin.endsWith('.vercel.app'));
            if (isAllowed) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
// Register all real-time event handlers (chat, code, whiteboard, rtc, proctor)
index.initSocket(io);
// Connect to MongoDB first; only bind the HTTP port on success.
// If the DB is unreachable we exit immediately so the process manager restarts.
db.connectDB()
    .then(() => {
    server.listen(PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
})
    .catch((err) => {
    logger.error('Failed to connect to database', err);
    process.exit(1); // non-recoverable — let systemd / Docker restart the container
});
