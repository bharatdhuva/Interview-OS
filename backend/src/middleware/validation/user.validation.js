/**
 * middleware/validation/user.validation.ts
 *
 * Zod schemas for user profile and password update request bodies.
 */
const zod = require("zod");
const optionalUrl = zod.z.union([zod.z.literal(''), zod.z.string().url()]).optional();

/** Schema for PATCH /api/v1/users/profile */
exports.updateProfileSchema = zod.z.object({
    name: zod.z.string().min(2).max(50).optional(),
    avatar: optionalUrl,
    headline: zod.z.string().max(120).optional(),
    bio: zod.z.string().max(600).optional(),
    skills: zod.z.array(zod.z.string().trim().min(1).max(40)).max(25).optional(),
    experienceLevel: zod.z.enum(['student', 'junior', 'mid', 'senior', 'staff']).optional(),
    targetRole: zod.z.string().max(100).optional(),
    githubUrl: optionalUrl,
    linkedinUrl: optionalUrl,
    portfolioUrl: optionalUrl,
});
/** Schema for PATCH /api/v1/users/password */
exports.changePasswordSchema = zod.z.object({
    currentPassword: zod.z.string().min(8), // verified against the stored hash
    newPassword: zod.z.string().min(8), // will be hashed before persisting
});
