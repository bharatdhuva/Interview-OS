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

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;       // undefined for Google-only accounts
  role: 'candidate' | 'interviewer' | 'admin';
  avatar?: string;             // URL to profile picture
  googleId?: string;           // Google OAuth2 sub claim
  isEmailVerified: boolean;
  refreshTokens: string[];     // active refresh token pool (rotation strategy)
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },   // omitted for Google-only users
    role: {
      type: String,
      enum: ['candidate', 'interviewer', 'admin'],
      default: 'candidate',
    },
    avatar:           { type: String },
    googleId:         { type: String },
    isEmailVerified:  { type: Boolean, default: false },
    refreshTokens:    [{ type: String }], // array of active refresh tokens
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
