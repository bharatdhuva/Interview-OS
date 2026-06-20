/**
 * middleware/validation/feedback.validation.ts
 *
 * Zod schema for feedback submission request body.
 */
const zod = require("zod");
/** Schema for POST /api/v1/feedback */
exports.submitFeedbackSchema = zod.z.object({
    roomId: zod.z.string(), // MongoDB ObjectId of the interview room
    sessionId: zod.z.string(), // MongoDB ObjectId of the interview session
    // Each rating is an integer on a 1–5 scale
    ratings: zod.z.object({
        problemSolving: zod.z.number().min(1).max(5),
        codeQuality: zod.z.number().min(1).max(5),
        communication: zod.z.number().min(1).max(5),
        efficiency: zod.z.number().min(1).max(5),
    }),
    strengths: zod.z.string().optional(), // free-text strengths observed
    improvements: zod.z.string().optional(), // free-text areas for improvement
    overallNotes: zod.z.string().optional(), // any additional notes
    recommendation: zod.z.enum(['strong_yes', 'yes', 'no', 'strong_no']),
});
