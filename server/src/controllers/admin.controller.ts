/**
 * controllers/admin.controller.ts
 *
 * Admin-only management handlers.  All routes are protected with
 * `protect` + `authorize('admin')` in admin.route.ts.
 *
 * Endpoints:
 *  GET    /api/v1/admin/users              — getAllUsers
 *  PATCH  /api/v1/admin/users/:id/role     — changeUserRole
 *  DELETE /api/v1/admin/users/:id          — deleteUser
 *  GET    /api/v1/admin/rooms              — getAllRooms
 *  POST   /api/v1/admin/rooms/:id/force-end — forceEndRoom
 *  GET    /api/v1/admin/analytics          — getSystemAnalytics
 */

import { Response } from 'express';
import { User } from '../models/user.model';
import { InterviewRoom } from '../models/room.model';
import { InterviewSession } from '../models/session.model';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * GET /api/v1/admin/users?page=1&limit=20
 *
 * Paginated list of all platform users (sorted newest first).
 * Sensitive fields (passwordHash, refreshTokens) are never returned.
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Parse pagination query params with sensible defaults
    const page  = parseInt(req.query.page  as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip  = (page - 1) * limit;

    const users = await User.find()
      .select('-passwordHash -refreshTokens')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      count:  users.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error: any) {
    logger.error('Error fetching users (Admin)', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PATCH /api/v1/admin/users/:id/role
 *
 * Updates a user’s role.  Validates that the supplied role is one of
 * the three allowed values before persisting.
 */
export const changeUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    if (!['candidate', 'interviewer', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-passwordHash -refreshTokens');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    logger.error('Error changing user role', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * DELETE /api/v1/admin/users/:id
 *
 * Hard-deletes a user account.  Note: associated rooms / sessions are NOT
 * cascade-deleted; consider a soft-delete / archiving strategy for production.
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting user', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/v1/admin/rooms
 *
 * Returns all interview rooms on the platform (populated with user info),
 * sorted by most recent scheduled time.
 */
export const getAllRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await InterviewRoom.find()
      .populate('interviewer', 'name email avatar')
      .populate('candidate',   'name email avatar')
      .sort({ scheduledAt: -1 });

    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error: any) {
    logger.error('Error fetching all rooms (Admin)', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/v1/admin/rooms/:id/force-end
 *
 * Administratively terminates an active room, closes the in-progress
 * session, and marks the proctoring result as 'terminated'.
 * Used when a session must be stopped from the admin dashboard.
 */
export const forceEndRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await InterviewRoom.findById(req.params.id);

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    room.status = 'completed';
    await room.save();

    // Close the most recent open session if one exists
    const session = await InterviewSession.findOne({
      room: room._id,
      endTime: { $exists: false },
    }).sort({ startTime: -1 });

    if (session) {
      session.endTime = new Date();
      session.durationSeconds = Math.floor(
        (session.endTime.getTime() - session.startTime.getTime()) / 1000
      );
      session.proctoringResult = 'terminated'; // flag forced termination
      await session.save();
    }

    res.status(200).json({ success: true, message: 'Room forcefully ended' });
  } catch (error: any) {
    logger.error('Error force ending room', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/v1/admin/analytics
 *
 * Returns high-level platform statistics in a single response by running
 * four count queries in parallel with Promise.all for efficiency.
 */
export const getSystemAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Run all count queries concurrently to minimise response time
    const [totalUsers, totalRooms, completedRooms, activeRooms] = await Promise.all([
      User.countDocuments(),
      InterviewRoom.countDocuments(),
      InterviewRoom.countDocuments({ status: 'completed' }),
      InterviewRoom.countDocuments({ status: 'active' }),
    ]);

    res.status(200).json({
      success: true,
      data: { totalUsers, totalRooms, completedRooms, activeRooms },
    });
  } catch (error: any) {
    logger.error('Error fetching system analytics', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
