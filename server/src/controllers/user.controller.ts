/**
 * controllers/user.controller.ts
 *
 * User profile management handlers.
 *
 * All routes are protected — req.user is guaranteed to be populated.
 *
 * Endpoints:
 *  GET    /api/v1/users/profile            — getProfile
 *  PATCH  /api/v1/users/profile            — updateProfile
 *  PATCH  /api/v1/users/password           — changePassword
 *  GET    /api/v1/users/:id/interviews     — getInterviewHistory
 */

import { Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { InterviewRoom } from '../models/room.model';
import logger from '../utils/logger';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '../middleware/validation/user.validation';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * GET /api/v1/users/profile
 *
 * Returns the authenticated user’s profile (sensitive fields stripped).
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash -refreshTokens');
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    logger.error('Error fetching profile', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PATCH /api/v1/users/profile
 *
 * Partially updates the user’s name and/or avatar URL.
 * Runs Mongoose validators so, for example, a malformed avatar URL is rejected.
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      validatedData,
      { new: true, runValidators: true }
    ).select('-passwordHash -refreshTokens');

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    logger.error('Error updating profile', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};

/**
 * PATCH /api/v1/users/password
 *
 * Changes the user’s password.
 * - Verifies the current password before accepting the new one.
 * - Hashes the new password with bcrypt (cost 12).
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Confirm the supplied current password matches the stored hash
    const isMatch = await bcrypt.compare(validatedData.currentPassword, user.passwordHash as string);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password' });
      return;
    }

    user.passwordHash = await bcrypt.hash(validatedData.newPassword, 12);
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    logger.error('Error changing password', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to change password' });
  }
};

/**
 * GET /api/v1/users/:id/interviews
 *
 * Returns completed interview rooms where the target user was a participant.
 * Access rules:
 *  - A user can always view their own history.
 *  - Only admins can view another user’s history.
 */
export const getInterviewHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Enforce ownership / admin-only access
    if (req.params.id !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const rooms = await InterviewRoom.find({
      $or: [{ interviewer: req.params.id }, { candidate: req.params.id }],
      status: 'completed',
    })
      .populate('interviewer', 'name avatar')
      .populate('candidate', 'name avatar')
      .sort({ scheduledAt: -1 }); // most recent first

    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error: any) {
    logger.error('Error fetching interview history', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
