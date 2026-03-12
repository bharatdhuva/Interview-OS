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

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import logger from './utils/logger';
import authRoutes from './routes/auth.route';
import executionRoutes from './routes/execution.route';
import roomRoutes from './routes/room.route';
import userRoutes from './routes/user.route';
import feedbackRoutes from './routes/feedback.route';
import adminRoutes from './routes/admin.route';

const app: Application = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
// helmet() sets a collection of secure HTTP response headers in one call:
//   Content-Security-Policy, X-Frame-Options, X-XSS-Protection, HSTS, etc.
app.use(helmet());

// CORS — only allow the configured client origin; cookies travel with each
// credentialed request so `credentials: true` must match the front-end setting.
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:8080',
    credentials: true,
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Prevents brute-force / DoS attacks by capping requests-per-IP per window.
// Values are read from .env so they can be tuned without code changes.
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // default 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),               // default 100 req / window
  message: 'Too many requests from this IP, please try again later.',
});
// Apply only to /api so static / health routes are not throttled.
app.use('/api', limiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
// Limit raised to 10 mb to support large code payloads and whiteboard snapshots.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── HTTP Request Logging ─────────────────────────────────────────────────────
// Morgan writes combined-format logs; the stream pipes them into Winston so all
// log output goes through one consistent transport (console / file / etc.).
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// ─── Health Check ─────────────────────────────────────────────────────────────
// Simple liveness probe — returns 200 when the process is up and running.
// Does NOT check database or external services (use a readiness probe for that).
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// ─── Feature Routers ──────────────────────────────────────────────────────────
app.use('/api/v1/auth',     authRoutes);          // register, login, logout, /me
app.use('/api/v1/rooms',    roomRoutes);           // CRUD + session lifecycle
app.use('/api/v1/rooms/:roomId/code', executionRoutes); // code execution (mergeParams)
app.use('/api/v1/users',    userRoutes);           // profile & interview history
app.use('/api/v1/feedback', feedbackRoutes);       // submit / view / share feedback
app.use('/api/v1/admin',    adminRoutes);          // admin-only management endpoints

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Any error passed to next(err) lands here.  Returns a uniform JSON envelope
// so no raw stack traces or HTML error pages leak to the client.
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
