import { z } from 'zod';

export const createRoomSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  candidateEmail: z.string().email(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(240),
  problemStatement: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const updateRoomSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(15).max(240).optional(),
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled']).optional(),
  problemStatement: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const joinRoomSchema = z.object({
  inviteToken: z.string().min(10),
});
