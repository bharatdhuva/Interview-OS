/**
 * middleware/validation/auth.validation.ts
 *
 * Zod schemas for authentication request bodies.
 *
 * These schemas are used inside the auth controller via `schema.parse(req.body)`.
 * A Zod parse failure throws a ZodError, which the controller catches and
 * converts to a 400 Bad Request response.
 */
const zod = require("zod");
/** Schema for POST /api/v1/auth/register */
exports.registerSchema = zod.z.object({
    name: zod.z.string().min(2).max(100),
    email: zod.z.string().email(),
    password: zod.z.string().min(6),
    // Optional — defaults to 'candidate' in the controller if omitted
    role: zod.z.enum(['candidate', 'interviewer', 'admin']).optional(),
});
/** Schema for POST /api/v1/auth/login */
exports.loginSchema = zod.z.object({
    email: zod.z.string().email(),
    password: zod.z.string().min(1), // at least 1 char so we get a useful message
});
/** Schema for POST /api/v1/auth/google */
exports.googleAuthSchema = zod.z.object({
    token: zod.z.string(), // Google OAuth2 access token
    role: zod.z.enum(['candidate', 'interviewer', 'admin']).optional(),
});
/** Schema for POST /api/v1/auth/github */
exports.githubAuthSchema = zod.z.object({
    code: zod.z.string(), // GitHub OAuth2 authorization code
    role: zod.z.enum(['candidate', 'interviewer', 'admin']).optional(),
});
/** Schema for POST /api/v1/auth/verify-email */
exports.verifyEmailSchema = zod.z.object({
    email: zod.z.string().email(),
    token: zod.z.string().min(32), // should be 32-char hex token
});
/** Schema for POST /api/v1/auth/resend-verification-email */
exports.resendVerificationSchema = zod.z.object({
    email: zod.z.string().email(),
});
/** Schema for POST /api/v1/auth/forgot-password */
exports.forgotPasswordSchema = zod.z.object({
    email: zod.z.string().email(),
});
/** Schema for POST /api/v1/auth/reset-password */
exports.resetPasswordSchema = zod.z.object({
    email: zod.z.string().email(),
    token: zod.z.string().length(6, "OTP must be exactly 6 digits"),
    newPassword: zod.z.string().min(6),
});
/** Schema for POST /api/v1/auth/onboard */
exports.onboardSchema = zod.z.object({
    role: zod.z.enum(['candidate', 'interviewer']),
});
