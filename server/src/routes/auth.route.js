"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ─ Public endpoints ────────────────────────────────────────────────────────
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/google', auth_controller_1.googleSignIn);
router.post('/logout', auth_controller_1.logout);
// ─ Protected endpoints ────────────────────────────────────────────────
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
exports.default = router;
