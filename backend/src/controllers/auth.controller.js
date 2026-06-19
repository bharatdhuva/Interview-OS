"use strict";
/**
 * controllers/auth.controller.ts
 *
 * Authentication handlers: register, login, logout, getMe, Google OAuth.
 *
 * Token strategy:
 *  - Access token  (15 min) returned in the JSON body — kept in memory by the client.
 *  - Refresh token (7 days) stored in an httpOnly Secure SameSite=Strict cookie
 *    to reduce XSS exposure.
 *
 * All input is validated with Zod schemas before any DB work is done.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardUser = exports.githubSignIn = exports.googleSignIn = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const user_model_1 = require("../models/user.model");
const jwt_1 = require("../utils/jwt");
const logger_1 = __importDefault(require("../utils/logger"));
const auth_validation_1 = require("../middleware/validation/auth.validation");
// ─── Refresh-cookie configuration ────────────────────────────────────────────
// httpOnly prevents JS access; Secure ensures HTTPS-only in production;
// SameSite=None in production allows cross-site requests (frontend on Vercel, backend on Render).
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};
/** Helper: set the refresh token as a cookie on the response. */
const setRefreshCookie = (res, token) => {
    res.cookie('refreshToken', token, REFRESH_COOKIE_OPTIONS);
};

/**
 * Fire-and-forget welcome email helper.
 * Auth flow must never fail because of email provider issues.
 */
const sendWelcomeEmailSafely = async (user) => {
    try {
        const emailService = require('../utils/emailService');
        await emailService.sendWelcomeEmail(user.email, user.name);
    }
    catch (error) {
        logger_1.default.error('Failed to send welcome email', error);
    }
};
const sendPasswordResetSuccessEmailSafely = async (user) => {
    try {
        const emailService = require('../utils/emailService');
        await emailService.sendPasswordResetSuccessEmail(user.email, user.name);
    }
    catch (error) {
        logger_1.default.error('Failed to send password reset confirmation email', error);
    }
};
// ─── Handlers ────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/register
 *
 * Creates a new user account, issues an access + refresh token pair.
 * - Password is hashed with bcrypt (cost factor 12).
 * - Refresh token is appended to the user’s token pool and set as a cookie.
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role } = auth_validation_1.registerSchema.parse(req.body);
        // Prevent duplicate accounts, unless it's a placeholder candidate account
        const existingUser = await user_model_1.User.findOne({ email });
        const isPlaceholder = existingUser && 
                             existingUser.passwordHash === 'placeholder' && 
                             !existingUser.googleId && 
                             !existingUser.githubId;
        if (existingUser && !isPlaceholder) {
            res.status(400).json({ success: false, message: 'Email already exists' });
            return;
        }
        // Hash the password before persisting (salt rounds = 12)
        const passwordHash = await bcrypt_1.default.hash(password, 12);
        let user;
        if (isPlaceholder) {
            existingUser.name = name;
            existingUser.passwordHash = passwordHash;
            existingUser.role = role || existingUser.role || 'candidate';
            existingUser.isOnboarded = false;
            user = await existingUser.save();
        } else {
            user = await user_model_1.User.create({
                name,
                email,
                passwordHash,
                role: role || 'candidate',
                isOnboarded: false,
            });
        }

        /* 
        // Verification email logic - DISABLED as per user request
        const TokenService = require('../utils/tokenService');
        const verificationToken = await TokenService.createEmailVerificationToken(user);

        const emailService = require('../utils/emailService');
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
        
        try {
            await emailService.sendVerificationEmail(email, verificationToken, verificationUrl);
        } catch (emailError) {
            logger_1.default.error('Failed to send verification email after registration', emailError);
        }
        */

        // Send welcome email directly
        sendWelcomeEmailSafely(user).catch(() => undefined);

        // Generate tokens and persist the refresh token
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        user.refreshTokens.push(refreshToken);
        await user.save();
        setRefreshCookie(res, refreshToken);
        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken,
                isEmailVerified: true,
                isOnboarded: user.isOnboarded,
                message: 'Account created successfully!'
            },
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
            return;
        }
        logger_1.default.error('Register error', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};
exports.register = register;
/**
 * POST /api/v1/auth/login
 *
 * Authenticates an existing user with email + password.
 * Returns a fresh access token and sets a refresh token cookie.
 */
const login = async (req, res) => {
    try {
        const { email, password } = auth_validation_1.loginSchema.parse(req.body);
        // Look up user and verify password hash
        const user = await user_model_1.User.findOne({ email });
        if (!user || !user.passwordHash) {
            // Return a generic message to avoid user enumeration
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        user.refreshTokens.push(refreshToken);
        await user.save();
        setRefreshCookie(res, refreshToken);

        res.status(200).json({
            success: true,
            data: { id: user.id, name: user.name, email: user.email, role: user.role, isOnboarded: user.isOnboarded, accessToken },
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
            return;
        }
        logger_1.default.error('Login error', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};
exports.login = login;
/**
 * POST /api/v1/auth/logout
 *
 * Invalidates the current refresh token by removing it from the user’s
 * token pool (token rotation — the cookie is also cleared).
 * Responds 200 even if the token is missing / already invalid.
 */
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            // Verify the token to get the user ID, then remove it from the pool
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            await user_model_1.User.findByIdAndUpdate(decoded.id, {
                $pull: { refreshTokens: refreshToken },
            });
        }
        res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) {
        // Even if token verification fails, clear the cookie and report success
        logger_1.default.error('Logout error', error);
        res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
};
exports.logout = logout;
/**
 * GET /api/v1/auth/me  (protected)
 *
 * Returns the currently authenticated user attached to req.user by the
 * `protect` middleware. No DB query needed here.
 */
const getMe = async (req, res) => {
    res.status(200).json({ success: true, data: req.user });
};
exports.getMe = getMe;
/**
 * POST /api/v1/auth/google
 *
 * Exchanges a Google OAuth2 access token for platform credentials.
 *
 * Flow:
 *  1. Verify the Google token by hitting the Google UserInfo endpoint.
 *  2. Find or create a user document for the returned email.
 *  3. Link the Google sub claim if the email already exists as a local account.
 *  4. Issue the standard access + refresh token pair.
 */
const googleSignIn = async (req, res) => {
    try {
        const { token } = auth_validation_1.googleAuthSchema.parse(req.body);
        // Verify with Google — this also validates the token hasn't been tampered with
        const googleRes = await axios_1.default.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!googleRes.data?.email) {
            res.status(401).json({ success: false, message: 'Invalid Google Token' });
            return;
        }
        const { email, name, sub: googleId, picture } = googleRes.data;
        let user = await user_model_1.User.findOne({ email });
        if (!user) {
            // First time Google sign-in — auto-register the user
            user = await user_model_1.User.create({
                name: name || 'Google User',
                email,
                googleId,
                avatar: picture,
                role: 'candidate',
                isOnboarded: false,
                isEmailVerified: true, // Google has already verified the email
            });
            // Send welcome email directly
            sendWelcomeEmailSafely(user).catch(() => undefined);
        }
        else if (!user.googleId) {
            // Existing email/password account — link Google ID to it
            user.googleId = googleId;
            user.isEmailVerified = true;
            if (picture && !user.avatar)
                user.avatar = picture;
            await user.save();
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        user.refreshTokens.push(refreshToken);
        await user.save();
        setRefreshCookie(res, refreshToken);

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isOnboarded: user.isOnboarded,
                accessToken,
            },
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
            return;
        }
        logger_1.default.error('Google Sign-In error', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
        });
        res.status(500).json({ success: false, message: 'Server error during Google authentication' });
    }
};
exports.googleSignIn = googleSignIn;

/**
 * POST /api/v1/auth/github
 *
 * Exchanges a GitHub OAuth2 code for platform credentials.
 */
const githubSignIn = async (req, res) => {
    try {
        const { code } = auth_validation_1.githubAuthSchema.parse(req.body);
        
        // Exchange code for access token
        const tokenRes = await axios_1.default.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        }, {
            headers: { Accept: 'application/json' },
        });
        
        const githubAccessToken = tokenRes.data?.access_token;
        if (!githubAccessToken) {
            res.status(400).json({ success: false, message: 'Failed to retrieve GitHub access token' });
            return;
        }

        // Fetch user profile
        const userRes = await axios_1.default.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${githubAccessToken}`,
                'User-Agent': 'InterviewOS',
            },
        });

        // Fetch user email addresses
        const emailsRes = await axios_1.default.get('https://api.github.com/user/emails', {
            headers: {
                Authorization: `token ${githubAccessToken}`,
                'User-Agent': 'InterviewOS',
            },
        });

        const primaryEmailObj = emailsRes.data?.find(email => email.primary && email.verified);
        const email = primaryEmailObj ? primaryEmailObj.email : (userRes.data?.email || (emailsRes.data?.[0] ? emailsRes.data[0].email : null));

        if (!email) {
            res.status(400).json({ success: false, message: 'No verified email associated with this GitHub account' });
            return;
        }

        const { id: githubId, name, login, avatar_url } = userRes.data;
        let user = await user_model_1.User.findOne({ email });

        if (!user) {
            // First time GitHub sign-in — auto-register the user
            user = await user_model_1.User.create({
                name: name || login || 'GitHub User',
                email,
                githubId: String(githubId),
                avatar: avatar_url,
                role: 'candidate',
                isOnboarded: false,
                isEmailVerified: true,
            });
            // Send welcome email directly
            sendWelcomeEmailSafely(user).catch(() => undefined);
        }
        else {
            // Link GitHub ID if not already linked
            let updated = false;
            if (!user.githubId) {
                user.githubId = String(githubId);
                updated = true;
            }
            if (avatar_url && !user.avatar) {
                user.avatar = avatar_url;
                updated = true;
            }
            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                updated = true;
            }
            if (updated) {
                await user.save();
            }
        }

        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        user.refreshTokens.push(refreshToken);
        await user.save();
        setRefreshCookie(res, refreshToken);

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isOnboarded: user.isOnboarded,
                accessToken,
            },
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
            return;
        }
        logger_1.default.error('GitHub Sign-In error', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
        });
        res.status(500).json({ success: false, message: 'Server error during GitHub authentication' });
    }
};
exports.githubSignIn = githubSignIn;

/**
 * POST /api/v1/auth/verify-email
 *
 * Verifies a user's email using a one-time token sent via email.
 * Once verified, user can log in normally.
 */
const verifyEmail = async (req, res) => {
    try {
        const { email, token } = auth_validation_1.verifyEmailSchema.parse(req.body);
        const user = await user_model_1.User.findOne({ email });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        if (user.isEmailVerified) {
            res.status(400).json({ success: false, message: 'Email already verified' });
            return;
        }

        // Use tokenService to verify the token
        const TokenService = require('../utils/tokenService');
        const isValid = await TokenService.verifyEmailToken(user, token);

        if (!isValid) {
            res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. Welcome to InterviewOS!',
            data: { id: user.id, email: user.email, name: user.name },
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
            return;
        }
        logger_1.default.error('Email verification error', error);
        res.status(500).json({ success: false, message: 'Server error during email verification' });
    }
};
exports.verifyEmail = verifyEmail;

/**
 * POST /api/v1/auth/resend-verification-email
 *
 * Resends the verification email to the user.
 * Useful if the original email was lost or expired.
 */
const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = auth_validation_1.resendVerificationSchema.parse(req.body);
        const user = await user_model_1.User.findOne({ email });

        if (!user) {
            // Don't reveal whether email exists (security)
            res.status(200).json({ success: true, message: 'If account exists, verification email will be sent' });
            return;
        }

        if (user.isEmailVerified) {
            res.status(400).json({ success: false, message: 'Email is already verified' });
            return;
        }

        // Generate new verification token
        const TokenService = require('../utils/tokenService');
        const verificationToken = await TokenService.createEmailVerificationToken(user);

        // Send verification email
        const emailService = require('../utils/emailService');
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;

        await emailService.sendVerificationEmail(email, verificationToken, verificationUrl).catch((err) => {
            logger_1.default.error('Failed to send verification email', err);
        });

        res.status(200).json({
            success: true,
            message: 'Verification email has been sent. Check your inbox.',
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
            return;
        }
        logger_1.default.error('Resend verification email error', error);
        res.status(500).json({ success: false, message: 'Server error while sending verification email' });
    }
};
exports.resendVerificationEmail = resendVerificationEmail;

/**
 * POST /api/v1/auth/forgot-password
 *
 * Sends a password reset email to the provided email address.
 * The email contains a link with a one-time reset token (1 hour expiry).
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = auth_validation_1.forgotPasswordSchema.parse(req.body);
        const user = await user_model_1.User.findOne({ email });

        if (!user) {
            // Don't reveal whether email exists (security)
            res.status(200).json({ success: true, message: 'If account exists, password reset email will be sent' });
            return;
        }

        // Generate password reset token
        const TokenService = require('../utils/tokenService');
        const resetToken = await TokenService.createPasswordResetToken(user);

        // Send password reset OTP email
        const emailService = require('../utils/emailService');

        await emailService.sendPasswordResetEmail(email, resetToken).catch((err) => {
            logger_1.default.error('Failed to send password reset OTP email', err);
        });

        res.status(200).json({
            success: true,
            message: 'Password reset OTP has been sent. Check your inbox.',
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
            return;
        }
        logger_1.default.error('Forgot password error', error);
        res.status(500).json({ success: false, message: 'Server error while processing password reset' });
    }
};
exports.forgotPassword = forgotPassword;

/**
 * POST /api/v1/auth/reset-password
 *
 * Resets the user's password using a one-time token.
 * Token must be valid and not expired (1 hour from creation).
 */
const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = auth_validation_1.resetPasswordSchema.parse(req.body);
        const user = await user_model_1.User.findOne({ email });

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        // Verify the reset token
        const TokenService = require('../utils/tokenService');
        const isValid = await TokenService.verifyPasswordResetToken(user, token);

        if (!isValid) {
            res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
            return;
        }

        // Hash new password and save
        const newPasswordHash = await bcrypt_1.default.hash(newPassword, 12);
        user.passwordHash = newPasswordHash;

        // Clear all refresh tokens (force re-login on all devices)
        user.refreshTokens = [];

        // Clear the reset token
        await TokenService.clearPasswordResetToken(user);

        // Send password reset success email
        sendPasswordResetSuccessEmailSafely(user).catch(() => undefined);

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. Please log in with your new password.',
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
            return;
        }
        logger_1.default.error('Reset password error', error);
        res.status(500).json({ success: false, message: 'Server error while resetting password' });
    }
};
exports.resetPassword = resetPassword;

/**
 * POST /api/v1/auth/refresh
 *
 * Exchanges a refresh token for a new access token.
 * Refresh token is read from the httpOnly cookie.
 * 
 * Implements refresh token rotation: the old token is replaced with a new one.
 */
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            res.status(401).json({ success: false, message: 'Refresh token not found' });
            return;
        }

        // Verify the refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await user_model_1.User.findById(decoded.id);

        if (!user || !user.refreshTokens.includes(refreshToken)) {
            res.status(401).json({ success: false, message: 'Invalid refresh token' });
            return;
        }

        // Generate new access token and refresh token (rotation)
        const newAccessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(user.id);

        // Update refresh tokens: remove old, add new
        user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        // Set new refresh token cookie
        res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

        res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken,
                expiresIn: '15m',
            },
        });
    } catch (error) {
        logger_1.default.error('Token refresh error', error);
        res.status(401).json({ success: false, message: 'Failed to refresh token' });
    }
};
exports.refresh = refresh;

/**
 * POST /api/v1/auth/onboard
 *
 * Saves the selected role and marks the user as onboarded.
 */
const onboardUser = async (req, res) => {
    try {
        const { role } = auth_validation_1.onboardSchema.parse(req.body);
        const user = await user_model_1.User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        user.role = role;
        user.isOnboarded = true;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isOnboarded: user.isOnboarded,
            }
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
            return;
        }
        logger_1.default.error('Onboarding error', error);
        res.status(500).json({ success: false, message: 'Server error during onboarding' });
    }
};
exports.onboardUser = onboardUser;
