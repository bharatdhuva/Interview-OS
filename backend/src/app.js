/**
 * app.ts
 *
 * Express application factory.
 *
 * Responsibilities:
 *  - Register global security middleware (Helmet, CORS, rate-limiter)
 *  - Configure body parsers and HTTP request logging (Morgan → Winston)
 *  - Mount all feature routers under /api/v1
 *  - Provide a health-check endpoint for Docker / load-balancer probes
 *  - Attach the centralised error-handling middleware last in the chain
 */
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const expressRateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const logger = require("./utils/logger");
const authRoute = require("./routes/auth.route");
const executionRoute = require("./routes/execution.route");
const roomRoute = require("./routes/room.route");
const userRoute = require("./routes/user.route");
const feedbackRoute = require("./routes/feedback.route");
const app = express();
// ─── Security Headers ─────────────────────────────────────────────────────────
// helmet() sets a collection of secure HTTP response headers in one call:
//   Content-Security-Policy, X-Frame-Options, X-XSS-Protection, HSTS, etc.
app.use(helmet());
// CORS — allow the configured client origin, common dev environment ports,
// and dynamically allow all Vercel deployment subdomains in production.
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
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
    credentials: true,
}));
// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Prevents brute-force / DoS attacks by capping requests-per-IP per window.
// Values are read from .env so they can be tuned without code changes.
const limiter = expressRateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // default 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // default 100 req / window
    message: 'Too many requests from this IP, please try again later.',
});
// Apply only to /api so static / health routes are not throttled.
app.use('/api', limiter);
// ─── Body Parsers ─────────────────────────────────────────────────────────────
// Limit raised to 10 mb to support large code payloads and whiteboard snapshots.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// ─── HTTP Request Logging ─────────────────────────────────────────────────────
// Morgan writes combined-format logs; the stream pipes them into Winston so all
// log output goes through one consistent transport (console / file / etc.).
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
}));
// ─── Health Check ─────────────────────────────────────────────────────────────
// Simple liveness probe — returns 200 when the process is up and running.
// Does NOT check database or external services (use a readiness probe for that).
app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});
// ─── Feature Routers ──────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoute); // register, login, logout, /me
app.use('/api/v1/rooms', roomRoute); // CRUD + session lifecycle
app.use('/api/v1/rooms/:roomId/code', executionRoute); // code execution (mergeParams)
app.use('/api/v1/users', userRoute); // profile & interview history
app.use('/api/v1/feedback', feedbackRoute); // submit / view / share feedback
// ─── Global Error Handler ─────────────────────────────────────────────────────
// Any error passed to next(err) lands here.  Returns a uniform JSON envelope
// so no raw stack traces or HTML error pages leak to the client.
app.use((err, _req, res, _next) => {
    logger.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});
module.exports = app;
