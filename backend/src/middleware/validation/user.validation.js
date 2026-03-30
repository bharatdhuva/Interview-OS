"use strict";
/**
 * middleware/validation/user.validation.ts
 *
 * Zod schemas for user profile and password update request bodies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
/** Schema for PATCH /api/v1/users/profile */
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50).optional(),
    avatar: zod_1.z.string().url().optional(), // must be a valid URL (e.g. CDN link)
});
/** Schema for PATCH /api/v1/users/password */
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(8), // verified against the stored hash
    newPassword: zod_1.z.string().min(8), // will be hashed before persisting
});
