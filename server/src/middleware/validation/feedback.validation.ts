import { z } from 'zod';

export const submitFeedbackSchema = z.object({
  roomId: z.string(),
  sessionId: z.string(),
  ratings: z.object({
    problemSolving: z.number().min(1).max(5),
    codeQuality: z.number().min(1).max(5),
    communication: z.number().min(1).max(5),
    efficiency: z.number().min(1).max(5),
  }),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  overallNotes: z.string().optional(),
  recommendation: z.enum(['strong_yes', 'yes', 'no', 'strong_no']),
});
