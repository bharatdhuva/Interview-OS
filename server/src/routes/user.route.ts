import { Router } from 'express';
import { getProfile, updateProfile, changePassword, getInterviewHistory } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/password', changePassword);
router.get('/:id/interviews', getInterviewHistory);

export default router;
