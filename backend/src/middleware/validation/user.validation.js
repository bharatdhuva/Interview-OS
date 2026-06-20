/**
 * middleware/validation/user.validation.ts
 *
 * Zod schemas for user profile and password update request bodies.
 */
const zod = require("zod");
/** Schema for PATCH /api/v1/users/profile */
exports.updateProfileSchema = zod.z.object({
    name: zod.z.string().min(2).max(50).optional(),
    avatar: zod.z.string().url().optional(), // must be a valid URL (e.g. CDN link)
});
/** Schema for PATCH /api/v1/users/password */
exports.changePasswordSchema = zod.z.object({
    currentPassword: zod.z.string().min(8), // verified against the stored hash
    newPassword: zod.z.string().min(8), // will be hashed before persisting
});
