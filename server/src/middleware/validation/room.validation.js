"use strict";
/**
 * middleware/validation/room.validation.ts
 *
 * Zod schemas for interview room request bodies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinRoomSchema = exports.updateRoomSchema = exports.createRoomSchema = void 0;
const zod_1 = require("zod");
/** Schema for POST /api/v1/rooms (interviewer creates a new room) */
exports.createRoomSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().optional(),
    candidateEmail: zod_1.z.string().email(), // used to look up or auto-create the candidate
    scheduledAt: zod_1.z.string().datetime(), // ISO 8601 datetime string
    durationMinutes: zod_1.z.number().int().min(15).max(240),
    problemStatement: zod_1.z.string().optional(),
    techStack: zod_1.z.array(zod_1.z.string()).optional(),
    difficultyLevel: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
});
/** Schema for PATCH /api/v1/rooms/:roomId (partial update) */
exports.updateRoomSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100).optional(),
    description: zod_1.z.string().optional(),
    scheduledAt: zod_1.z.string().datetime().optional(),
    durationMinutes: zod_1.z.number().int().min(15).max(240).optional(),
    status: zod_1.z.enum(['scheduled', 'active', 'completed', 'cancelled']).optional(),
    problemStatement: zod_1.z.string().optional(),
    techStack: zod_1.z.array(zod_1.z.string()).optional(),
    difficultyLevel: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
});
/** Schema for joining a room via an invite link */
exports.joinRoomSchema = zod_1.z.object({
    inviteToken: zod_1.z.string().min(10),
});
