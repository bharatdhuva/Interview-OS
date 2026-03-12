/**
 * routes/user.route.ts
 *
 * User profile routes mounted at /api/v1/users
 *
 * All routes require a valid access token.
 *
 * GET    /profile           — get the authenticated user’s profile
 * PATCH  /profile           — update name and/or avatar
 * PATCH  /password          — change password (requires current password)
 * GET    /:id/interviews    — completed interview history for the given user
 *                             (own history or admin can request any user’s)
 */

import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getInterviewHistory,
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(protect);

router.get('/profile',           getProfile);
router.patch('/profile',         updateProfile);
router.patch('/password',        changePassword);
router.get('/:id/interviews',    getInterviewHistory);

export default router;
