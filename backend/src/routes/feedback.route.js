"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedback_controller_1 = require("../controllers/feedback.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All feedback routes require authentication
router.use(auth_middleware_1.protect);
router.post('/', (0, auth_middleware_1.authorize)('interviewer'), feedback_controller_1.submitFeedback);
router.get('/:roomId', feedback_controller_1.getFeedbackForRoom);
router.patch('/:roomId/share', (0, auth_middleware_1.authorize)('interviewer'), feedback_controller_1.shareFeedbackWithCandidate);
exports.default = router;
