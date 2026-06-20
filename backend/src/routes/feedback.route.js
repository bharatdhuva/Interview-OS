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
const feedbackController = require("../controllers/feedback.controller");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();
// All feedback routes require authentication
router.use(authMiddleware.protect);
router.post('/', authMiddleware.authorize('interviewer'), feedbackController.submitFeedback);
router.get('/:roomId', feedbackController.getFeedbackForRoom);
router.patch('/:roomId/share', authMiddleware.authorize('interviewer'), feedbackController.shareFeedbackWithCandidate);
module.exports = router;
