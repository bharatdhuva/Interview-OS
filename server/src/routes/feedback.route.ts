import { Router } from 'express';
import { submitFeedback, getFeedbackForRoom, shareFeedbackWithCandidate } from '../controllers/feedback.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', authorize('interviewer'), submitFeedback);
router.get('/:roomId', getFeedbackForRoom);
router.patch('/:roomId/share', authorize('interviewer'), shareFeedbackWithCandidate);

export default router;
