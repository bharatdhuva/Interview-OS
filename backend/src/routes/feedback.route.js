/**
 * routes/feedback.route.ts
 *
 * Interview feedback routes mounted at /api/v1/feedback
 *
 * All routes require authentication.
 *
 * POST   /                    — submit feedback (interviewer only)
 * GET    /:roomId              — get feedback for a room
 *                               (candidates see it only after it’s shared)
 * PATCH  /:roomId/share        — share feedback with the candidate (interviewer only)
 */
const express = require("express");
const expressRateLimit = require("express-rate-limit");
const feedbackController = require("../controllers/feedback.controller");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();

const aiDraftLimiter = expressRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { success: false, message: 'Too many AI draft requests, please try again later.' },
});

// All feedback routes require authentication
router.use(authMiddleware.protect);
router.post('/', authMiddleware.authorize('interviewer'), feedbackController.submitFeedback);
router.post('/:roomId/ai-draft', authMiddleware.authorize('interviewer'), aiDraftLimiter, feedbackController.generateAiDraft);
router.get('/:roomId/ai-draft', authMiddleware.authorize('interviewer'), feedbackController.getAiDraft);
router.get('/:roomId', feedbackController.getFeedbackForRoom);
router.patch('/:roomId/share', authMiddleware.authorize('interviewer'), feedbackController.shareFeedbackWithCandidate);
module.exports = router;
