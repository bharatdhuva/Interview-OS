/**
 * middleware/validation/room.validation.ts
 *
 * Zod schemas for interview room request bodies.
 */

import { z } from 'zod';

/** Schema for POST /api/v1/rooms (interviewer creates a new room) */
export const createRoomSchema = z.object({
  title:            z.string().min(3).max(100),
  description:      z.string().optional(),
  candidateEmail:   z.string().email(),          // used to look up or auto-create the candidate
  scheduledAt:      z.string().datetime(),        // ISO 8601 datetime string
  durationMinutes:  z.number().int().min(15).max(240),
  problemStatement: z.string().optional(),
  techStack:        z.array(z.string()).optional(),
  difficultyLevel:  z.enum(['easy', 'medium', 'hard']).optional(),
});

/** Schema for PATCH /api/v1/rooms/:roomId (partial update) */
export const updateRoomSchema = z.object({
  title:            z.string().min(3).max(100).optional(),
  description:      z.string().optional(),
  scheduledAt:      z.string().datetime().optional(),
  durationMinutes:  z.number().int().min(15).max(240).optional(),
  status:           z.enum(['scheduled', 'active', 'completed', 'cancelled']).optional(),
  problemStatement: z.string().optional(),
  techStack:        z.array(z.string()).optional(),
  difficultyLevel:  z.enum(['easy', 'medium', 'hard']).optional(),
});

/** Schema for joining a room via an invite link */
export const joinRoomSchema = z.object({
  inviteToken: z.string().min(10),
});
