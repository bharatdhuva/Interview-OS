"use strict";
/**
 * middleware/validation/auth.validation.ts
 *
 * Zod schemas for authentication request bodies.
 *
 * These schemas are used inside the auth controller via `schema.parse(req.body)`.
 * A Zod parse failure throws a ZodError, which the controller catches and
 * converts to a 400 Bad Request response.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardSchema = exports.githubAuthSchema = exports.googleAuthSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.resendVerificationSchema = exports.verifyEmailSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
/** Schema for POST /api/v1/auth/register */
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    // Optional — defaults to 'candidate' in the controller if omitted
    role: zod_1.z.enum(['candidate', 'interviewer', 'admin']).optional(),
});
/** Schema for POST /api/v1/auth/login */
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1), // at least 1 char so we get a useful message
});
/** Schema for POST /api/v1/auth/google */
exports.googleAuthSchema = zod_1.z.object({
    token: zod_1.z.string(), // Google OAuth2 access token
    role: zod_1.z.enum(['candidate', 'interviewer', 'admin']).optional(),
});
/** Schema for POST /api/v1/auth/github */
exports.githubAuthSchema = zod_1.z.object({
    code: zod_1.z.string(), // GitHub OAuth2 authorization code
    role: zod_1.z.enum(['candidate', 'interviewer', 'admin']).optional(),
});
/** Schema for POST /api/v1/auth/verify-email */
exports.verifyEmailSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    token: zod_1.z.string().min(32), // should be 32-char hex token
});
/** Schema for POST /api/v1/auth/resend-verification-email */
exports.resendVerificationSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
/** Schema for POST /api/v1/auth/forgot-password */
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
/** Schema for POST /api/v1/auth/reset-password */
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    token: zod_1.z.string().length(6, "OTP must be exactly 6 digits"),
    newPassword: zod_1.z.string().min(6),
});
/** Schema for POST /api/v1/auth/onboard */
exports.onboardSchema = zod_1.z.object({
    role: zod_1.z.enum(['candidate', 'interviewer']),
});
