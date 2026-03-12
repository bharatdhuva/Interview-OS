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

import { Router } from 'express';
import {
  submitFeedback,
  getFeedbackForRoom,
  shareFeedbackWithCandidate,
} from '../controllers/feedback.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// All feedback routes require authentication
router.use(protect);

router.post('/',                authorize('interviewer'), submitFeedback);
router.get('/:roomId',          getFeedbackForRoom);
router.patch('/:roomId/share',  authorize('interviewer'), shareFeedbackWithCandidate);

export default router;
