/**
 * middleware/validation/feedback.validation.ts
 *
 * Zod schema for feedback submission request body.
 */

import { z } from 'zod';

/** Schema for POST /api/v1/feedback */
export const submitFeedbackSchema = z.object({
  roomId:    z.string(),    // MongoDB ObjectId of the interview room
  sessionId: z.string(),   // MongoDB ObjectId of the interview session

  // Each rating is an integer on a 1–5 scale
  ratings: z.object({
    problemSolving: z.number().min(1).max(5),
    codeQuality:    z.number().min(1).max(5),
    communication:  z.number().min(1).max(5),
    efficiency:     z.number().min(1).max(5),
  }),

  strengths:    z.string().optional(),  // free-text strengths observed
  improvements: z.string().optional(),  // free-text areas for improvement
  overallNotes: z.string().optional(),  // any additional notes

  recommendation: z.enum(['strong_yes', 'yes', 'no', 'strong_no']),
});
