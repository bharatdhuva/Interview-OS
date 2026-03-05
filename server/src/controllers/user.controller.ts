import { Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { InterviewRoom } from '../models/room.model';
import logger from '../utils/logger';
import { updateProfileSchema, changePasswordSchema } from '../middleware/validation/user.validation';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash -refreshTokens');
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    logger.error('Error fetching profile', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(req.user?.id, validatedData, {
      new: true,
      runValidators: true,
    }).select('-passwordHash -refreshTokens');

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    logger.error('Error updating profile', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = changePasswordSchema.parse(req.body);
    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

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

export const getInterviewHistory = async (req: AuthRequest, res: Response) => {
  try {
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
      .sort({ scheduledAt: -1 });

    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error: any) {
    logger.error('Error fetching interview history', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
