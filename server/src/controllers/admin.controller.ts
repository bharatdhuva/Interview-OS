import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { InterviewRoom } from '../models/room.model';
import { InterviewSession } from '../models/session.model';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find()
             .select('-passwordHash -refreshTokens')
             .skip(skip)
             .limit(limit)
             .sort({ createdAt: -1 });
        
        const total = await User.countDocuments();

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: users
        });
    } catch (error: any) {
        logger.error('Error fetching users (Admin)', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const changeUserRole = async (req: AuthRequest, res: Response) => {
    try {
        const { role } = req.body;
        if (!['candidate', 'interviewer', 'admin'].includes(role)) {
            res.status(400).json({ success: false, message: 'Invalid role' });
            return;
        }

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash -refreshTokens');

        if (!user) {
             res.status(404).json({ success: false, message: 'User not found' });
             return;
        }

        res.status(200).json({ success: true, data: user });
    } catch (error: any) {
        logger.error('Error changing user role', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const deleteUser = async (req: AuthRequest, res: Response) => {
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
}

export const getAllRooms = async (req: AuthRequest, res: Response) => {
    try {
         const rooms = await InterviewRoom.find()
              .populate('interviewer', 'name email avatar')
              .populate('candidate', 'name email avatar')
              .sort({ scheduledAt: -1 });

         res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch(error: any) {
         logger.error('Error fetching all rooms (Admin)', error);
         res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const forceEndRoom = async (req: AuthRequest, res: Response) => {
    try {
        const room = await InterviewRoom.findById(req.params.id);

        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }

        room.status = 'completed';
        await room.save();

        const session = await InterviewSession.findOne({ room: room._id, endTime: { $exists: false } }).sort({ startTime: -1 });
               
        if (session) {
            session.endTime = new Date();
            session.durationSeconds = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
            session.proctoringResult = 'terminated'; // mark as terminated by admin
            await session.save();
        }

        res.status(200).json({ success: true, message: 'Room forcefully ended' });
    } catch(error: any) {
        logger.error('Error force ending room', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export const getSystemAnalytics = async (req: AuthRequest, res: Response) => {
     try {
         const totalUsers = await User.countDocuments();
         const totalRooms = await InterviewRoom.countDocuments();
         const completedRooms = await InterviewRoom.countDocuments({ status: 'completed' });
         const activeRooms = await InterviewRoom.countDocuments({ status: 'active' });

         res.status(200).json({
             success: true,
             data: {
                 totalUsers,
                 totalRooms,
                 completedRooms,
                 activeRooms
             }
         });
     } catch (error: any) {
         logger.error('Error fetching system analytics', error);
         res.status(500).json({ success: false, message: 'Server error' });
     }
}
