"use strict";
/**
 * middleware/validation/feedback.validation.ts
 *
 * Zod schema for feedback submission request body.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitFeedbackSchema = void 0;
const zod_1 = require("zod");
/** Schema for POST /api/v1/feedback */
exports.submitFeedbackSchema = zod_1.z.object({
    roomId: zod_1.z.string(), // MongoDB ObjectId of the interview room
    sessionId: zod_1.z.string(), // MongoDB ObjectId of the interview session
    // Each rating is an integer on a 1–5 scale
    ratings: zod_1.z.object({
        problemSolving: zod_1.z.number().min(1).max(5),
        codeQuality: zod_1.z.number().min(1).max(5),
        communication: zod_1.z.number().min(1).max(5),
        efficiency: zod_1.z.number().min(1).max(5),
    }),
    strengths: zod_1.z.string().optional(), // free-text strengths observed
    improvements: zod_1.z.string().optional(), // free-text areas for improvement
    overallNotes: zod_1.z.string().optional(), // any additional notes
    recommendation: zod_1.z.enum(['strong_yes', 'yes', 'no', 'strong_no']),
});
