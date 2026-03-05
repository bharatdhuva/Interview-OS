import { Response } from 'express';
import { InterviewRoom } from '../models/room.model';
import { User } from '../models/user.model';
import { InterviewSession } from '../models/session.model';
import { generateInviteToken } from '../utils/jwt';
import logger from '../utils/logger';
import { createRoomSchema } from '../middleware/validation/room.validation';
import { AuthRequest } from '../middleware/auth.middleware';

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createRoomSchema.parse(req.body);
    const interviewerId = req.user?.id;

    let candidate = await User.findOne({ email: validatedData.candidateEmail });
    if (!candidate) {
      candidate = await User.create({
        email: validatedData.candidateEmail,
        role: 'candidate',
        name: validatedData.candidateEmail.split('@')[0],
        passwordHash: 'placeholder',
      });
    }

    const room = await InterviewRoom.create({
      title: validatedData.title,
      description: validatedData.description,
      interviewer: interviewerId,
      candidate: candidate._id,
      scheduledAt: validatedData.scheduledAt,
      durationMinutes: validatedData.durationMinutes,
      problemStatement: validatedData.problemStatement,
      techStack: validatedData.techStack,
      difficultyLevel: validatedData.difficultyLevel,
    });

    room.inviteToken = generateInviteToken(room._id);
    room.inviteExpiresAt = new Date(
      new Date(validatedData.scheduledAt).getTime() + validatedData.durationMinutes * 60000
    );
    await room.save();

    res.status(201).json({ success: true, data: room });
  } catch (error: any) {
    logger.error('Error creating room', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to create room' });
  }
};

export const listMyRooms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const query = role === 'interviewer' ? { interviewer: userId } : { candidate: userId };

    const rooms = await InterviewRoom.find(query)
      .populate('interviewer', 'name email avatar')
      .populate('candidate', 'name email avatar')
      .sort({ scheduledAt: -1 });

    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error: any) {
    logger.error('Error fetching rooms', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRoomById = async (req: AuthRequest, res: Response) => {
  try {
    const room = await InterviewRoom.findById(req.params.roomId)
      .populate('interviewer', 'name email avatar')
      .populate('candidate', 'name email avatar');

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    const isInterviewer = room.interviewer?.toString() === req.user?.id;
    const isCandidate = room.candidate?.toString() === req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    if (!isInterviewer && !isCandidate && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized to access this room' });
      return;
    }

    res.status(200).json({ success: true, data: room });
  } catch (error: any) {
    logger.error('Error fetching room details', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const joinRoomViaToken = async (req: AuthRequest, res: Response) => {
  try {
    const { inviteToken } = req.params;

    const room = await InterviewRoom.findOne({ inviteToken })
      .populate('interviewer', 'name email avatar')
      .populate('candidate', 'name email avatar');

    if (!room) {
      res.status(404).json({ success: false, message: 'Invalid or expired invite token' });
      return;
    }

    if (room.inviteExpiresAt && new Date() > room.inviteExpiresAt) {
      res.status(400).json({ success: false, message: 'Invite token has expired' });
      return;
    }

    res.status(200).json({ success: true, data: room });
  } catch (error: any) {
    logger.error('Error joining room', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const startSession = async (req: AuthRequest, res: Response) => {
  try {
    const room = await InterviewRoom.findById(req.params.roomId);

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    if (room.interviewer.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Only the interviewer can start the session' });
      return;
    }

    room.status = 'active';
    await room.save();

    const session = await InterviewSession.create({
      room: room._id,
      startTime: new Date(),
    });

    res.status(200).json({ success: true, data: session });
  } catch (error: any) {
    logger.error('Error starting session', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const endSession = async (req: AuthRequest, res: Response) => {
  try {
    const room = await InterviewRoom.findById(req.params.roomId);

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    if (room.interviewer.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Only the interviewer can end the session' });
      return;
    }

    room.status = 'completed';
    await room.save();

    const session = await InterviewSession.findOne({
      room: room._id,
      endTime: { $exists: false },
    }).sort({ startTime: -1 });

    if (session) {
      session.endTime = new Date();
      session.durationSeconds = Math.floor(
        (session.endTime.getTime() - session.startTime.getTime()) / 1000
      );
      await session.save();
    }

    res.status(200).json({ success: true, data: session });
  } catch (error: any) {
    logger.error('Error ending session', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
