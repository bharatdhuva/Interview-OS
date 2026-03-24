"use strict";
/**
 * middleware/auth.middleware.ts
 *
 * Authentication and authorisation middleware.
 *
 * `protect`   — verifies the JWT access token from the Authorization header
 *               and attaches the decoded user to req.user.
 * `authorize` — factory that returns a middleware enforcing role-based access
 *               control; must be chained AFTER `protect`.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Protect middleware — validates the Bearer access token.
 *
 * Flow:
 *  1. Extract the token from the `Authorization: Bearer <token>` header.
 *  2. Verify signature and expiry using the JWT_ACCESS_SECRET.
 *  3. Load the full user document from MongoDB (ensures the user still exists
 *     and their data is fresh, e.g. role changes are immediately reflected).
 *  4. Attach the user to req.user and call next().
 *
 * Returns 401 if the token is missing, invalid, or the user no longer exists.
 */
const protect = async (req, res, next) => {
    try {
        // Extract token — only accept the Bearer scheme
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer') ? authHeader.split(' ')[1] : undefined;
        if (!token) {
            res.status(401).json({ success: false, message: 'Not authorized to access this route' });
            return;
        }
        // Verify and decode; throws if token is expired or signature is invalid
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        // Fetch user fresh from DB — excludes sensitive fields
        req.user = await user_model_1.User.findById(decoded.id).select('-passwordHash -refreshTokens');
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User belonging to token no longer exists' });
            return;
        }
        next();
    }
    catch (error) {
        logger_1.default.error('Auth middleware error', error);
        res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};
exports.protect = protect;
/**
 * Authorize middleware factory — restricts access to specific roles.
 *
 * Usage: router.get('/admin', protect, authorize('admin'), handler)
 *
 * @param roles - One or more roles that are allowed to access the route
 * @returns Express middleware that calls next() if the user has an allowed role,
 *          or responds with 403 Forbidden otherwise.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `User role '${req.user?.role}' is not authorized to access this route`,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
