/**
 * models/user.model.ts
 *
 * Mongoose model for platform users.
 *
 * Roles:
 *  - candidate   : person being interviewed; can view their own history
 *  - interviewer : creates rooms, runs sessions, submits feedback
 *  - admin       : full platform access (user management, analytics)
 *
 * Auth strategy:
 *  - Email/password login uses a bcrypt hash stored in `passwordHash`.
 *  - Google OAuth stores the Google `sub` claim in `googleId`;
 *    `passwordHash` is undefined for OAuth-only accounts.
 *  - Refresh token rotation: active tokens are stored in `refreshTokens[]`;
 *    logout removes the specific token; all are cleared on password change.
 */
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String }, // omitted for Google-only users
    role: {
        type: String,
        enum: ['candidate', 'interviewer', 'admin'],
        default: 'candidate',
    },
    avatar: { type: String },
    googleId: { type: String },
    githubId: { type: String },
    isOnboarded: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: true },
    // Email verification token (one-time use, expires)
    emailVerification: {
        token: { type: String },
        expiresAt: { type: Date },
    },
    // Password reset token (one-time use, 1 hour expiry)
    passwordReset: {
        token: { type: String },
        expiresAt: { type: Date },
    },
    refreshTokens: [{ type: String }], // array of active refresh tokens

}, {
    timestamps: true, // auto-manages createdAt and updatedAt
});
exports.User = mongoose.model('User', userSchema);
