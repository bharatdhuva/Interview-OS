"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
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
    isEmailVerified: { type: Boolean, default: false },
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
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', index: true },
    orgRole: {
        type: String,
        enum: ['owner', 'admin', 'interviewer', 'candidate'],
    },
    subscription: {
        stripeCustomerId: { type: String },
        stripeSubscriptionId: { type: String },
        plan: {
            type: String,
            enum: ['free', 'pro', 'team'],
            default: 'free',
        },
        status: {
            type: String,
            enum: ['active', 'cancelled', 'past_due', 'trialing', 'incomplete', 'unpaid'],
            default: 'active',
        },
        currentPeriodEnd: { type: Date },
        cancelAtPeriodEnd: { type: Boolean, default: false },
        trialEnd: { type: Date },
    },
}, {
    timestamps: true, // auto-manages createdAt and updatedAt
});
exports.User = mongoose_1.default.model('User', userSchema);
