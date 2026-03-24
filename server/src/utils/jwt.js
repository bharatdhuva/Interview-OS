"use strict";
/**
 * utils/jwt.ts
 *
 * JWT token factory helpers.
 *
 * Token strategy:
 *  - Access token  : short-lived (15 min default), sent in the Authorization header.
 *  - Refresh token : long-lived (7 days default), stored in an httpOnly cookie and
 *                    also persisted in the user document so it can be revoked.
 *  - Invite token  : single-use, 24-hour lifespan, encodes the room ID so a
 *                    recipient can join without being registered beforehand.
 *
 * Secrets fall back to hard-coded development values when the env vars are
 * missing.  In production these MUST be strong random strings stored in .env.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInviteToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// — Secrets (read once at module load time for performance) —
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'interviewos_access_secret_bharat_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'interviewos_refresh_secret_bharat_2026';
/**
 * Generates a short-lived access token embedding the user ID and role.
 * The role claim lets middleware perform RBAC without an extra DB query.
 *
 * @param userId - MongoDB ObjectId or string ID of the authenticated user
 * @param role   - User role (candidate | interviewer | admin)
 * @returns Signed JWT string
 */
const generateAccessToken = (userId, role) => jsonwebtoken_1.default.sign({ id: userId, role }, ACCESS_SECRET, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m'),
});
exports.generateAccessToken = generateAccessToken;
/**
 * Generates a long-lived refresh token used to obtain new access tokens.
 * Only the user ID is embedded — no role, as roles can change between refreshes.
 *
 * @param userId - MongoDB ObjectId or string ID of the authenticated user
 * @returns Signed JWT string
 */
const generateRefreshToken = (userId) => jsonwebtoken_1.default.sign({ id: userId }, REFRESH_SECRET, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d'),
});
exports.generateRefreshToken = generateRefreshToken;
/**
 * Generates a 24-hour invite token that encodes the room ID.
 * Sent to candidates via email so they can join the interview room
 * without needing prior authentication.
 *
 * @param roomId - MongoDB ObjectId or string ID of the interview room
 * @returns Signed JWT string
 */
const generateInviteToken = (roomId) => jsonwebtoken_1.default.sign({ roomId }, process.env.INVITE_TOKEN_SECRET, {
    expiresIn: '24h',
});
exports.generateInviteToken = generateInviteToken;
