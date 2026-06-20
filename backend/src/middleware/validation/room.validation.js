/**
 * middleware/validation/room.validation.ts
 *
 * Zod schemas for interview room request bodies.
 */
const zod = require("zod");
/** Schema for POST /api/v1/rooms (interviewer creates a new room) */
exports.createRoomSchema = zod.z.object({
    title: zod.z.string().min(3).max(100),
    description: zod.z.string().optional(),
    candidateEmail: zod.z.string().email(), // used to look up or auto-create the candidate
    scheduledAt: zod.z.string().datetime(), // ISO 8601 datetime string
    durationMinutes: zod.z.number().int().min(15).max(240),
    problemStatement: zod.z.string().optional(),
    mode: zod.z.enum(['live', 'take_home']).optional(),
    questionId: zod.z.string().optional(),
    techStack: zod.z.array(zod.z.string()).optional(),
    difficultyLevel: zod.z.enum(['easy', 'medium', 'hard']).optional(),
});
/** Schema for PATCH /api/v1/rooms/:roomId (partial update) */
exports.updateRoomSchema = zod.z.object({
    title: zod.z.string().min(3).max(100).optional(),
    description: zod.z.string().optional(),
    scheduledAt: zod.z.string().datetime().optional(),
    durationMinutes: zod.z.number().int().min(15).max(240).optional(),
    status: zod.z.enum(['scheduled', 'active', 'completed', 'cancelled']).optional(),
    problemStatement: zod.z.string().optional(),
    mode: zod.z.enum(['live', 'take_home']).optional(),
    questionId: zod.z.string().optional(),
    techStack: zod.z.array(zod.z.string()).optional(),
    difficultyLevel: zod.z.enum(['easy', 'medium', 'hard']).optional(),
});
/** Schema for joining a room via an invite link */
exports.joinRoomSchema = zod.z.object({
    inviteToken: zod.z.string().min(10),
});
