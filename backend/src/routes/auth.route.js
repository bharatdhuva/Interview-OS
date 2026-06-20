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
const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();
// ─ Public endpoints ────────────────────────────────────────────────────────
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleSignIn);
router.post('/github', authController.githubSignIn);
router.post('/logout', authController.logout);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification-email', authController.resendVerificationEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh', authController.refresh);
// ─ Protected endpoints ────────────────────────────────────────────────────
router.get('/me', authMiddleware.protect, authController.getMe);
router.post('/onboard', authMiddleware.protect, authController.onboardUser);
module.exports = router;
