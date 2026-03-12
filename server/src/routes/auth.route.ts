/**
 * routes/auth.route.ts
 *
 * Authentication routes mounted at /api/v1/auth
 *
 * Public (no token required):
 *  POST /register  — create a new account
 *  POST /login     — email + password login
 *  POST /google    — Google OAuth2 access-token exchange
 *  POST /logout    — clear refresh-token cookie
 *
 * Protected (Bearer access token required):
 *  GET  /me        — return the current user’s profile
 */

import { Router } from 'express';
import { register, login, logout, getMe, googleSignIn } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// ─ Public endpoints ────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);
router.post('/google',   googleSignIn);
router.post('/logout',   logout);

// ─ Protected endpoints ────────────────────────────────────────────────
router.get('/me', protect, getMe);

export default router;
