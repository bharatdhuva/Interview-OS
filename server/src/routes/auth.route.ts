import { Router } from 'express';
import { register, login, logout, getMe, googleSignIn } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleSignIn);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
