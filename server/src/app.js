"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const logger_1 = __importDefault(require("./utils/logger"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const execution_route_1 = __importDefault(require("./routes/execution.route"));
const room_route_1 = __importDefault(require("./routes/room.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const feedback_route_1 = __importDefault(require("./routes/feedback.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const app = (0, express_1.default)();
// ─── Security Headers ─────────────────────────────────────────────────────────
// helmet() sets a collection of secure HTTP response headers in one call:
//   Content-Security-Policy, X-Frame-Options, X-XSS-Protection, HSTS, etc.
app.use((0, helmet_1.default)());
// CORS — only allow the configured client origin; cookies travel with each
// credentialed request so `credentials: true` must match the front-end setting.
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:8080',
    credentials: true,
}));
// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Prevents brute-force / DoS attacks by capping requests-per-IP per window.
// Values are read from .env so they can be tuned without code changes.
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // default 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // default 100 req / window
    message: 'Too many requests from this IP, please try again later.',
});
// Apply only to /api so static / health routes are not throttled.
app.use('/api', limiter);
// ─── Body Parsers ─────────────────────────────────────────────────────────────
// Limit raised to 10 mb to support large code payloads and whiteboard snapshots.
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// ─── HTTP Request Logging ─────────────────────────────────────────────────────
// Morgan writes combined-format logs; the stream pipes them into Winston so all
// log output goes through one consistent transport (console / file / etc.).
app.use((0, morgan_1.default)('combined', {
    stream: { write: (message) => logger_1.default.info(message.trim()) },
}));
// ─── Health Check ─────────────────────────────────────────────────────────────
// Simple liveness probe — returns 200 when the process is up and running.
// Does NOT check database or external services (use a readiness probe for that).
app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});
// ─── Feature Routers ──────────────────────────────────────────────────────────
app.use('/api/v1/auth', auth_route_1.default); // register, login, logout, /me
app.use('/api/v1/rooms', room_route_1.default); // CRUD + session lifecycle
app.use('/api/v1/rooms/:roomId/code', execution_route_1.default); // code execution (mergeParams)
app.use('/api/v1/users', user_route_1.default); // profile & interview history
app.use('/api/v1/feedback', feedback_route_1.default); // submit / view / share feedback
app.use('/api/v1/admin', admin_route_1.default); // admin-only management endpoints
// ─── Global Error Handler ─────────────────────────────────────────────────────
// Any error passed to next(err) lands here.  Returns a uniform JSON envelope
// so no raw stack traces or HTML error pages leak to the client.
app.use((err, _req, res, _next) => {
    logger_1.default.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});
exports.default = app;
