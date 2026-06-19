"use strict";
/**
 * controllers/room.controller.ts
 *
 * Interview room lifecycle management.
 *
 * Handlers:
 *  createRoom        POST   /api/v1/rooms
 *  listMyRooms       GET    /api/v1/rooms
 *  getRoomById       GET    /api/v1/rooms/:roomId
 *  updateRoom        PATCH  /api/v1/rooms/:roomId
 *  cancelRoom        POST   /api/v1/rooms/:roomId/cancel
 *  joinRoomViaToken  GET    /api/v1/rooms/join/:inviteToken
 *  startSession      POST   /api/v1/rooms/:roomId/start
 *  endSession        POST   /api/v1/rooms/:roomId/end
 *
 * Room status flow:
 *   scheduled → active (startSession)
 *             → completed (endSession)
 *             → cancelled (cancelRoom)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReplayFrames = exports.cancelRoom = exports.updateRoom = exports.endSession = exports.startSession = exports.joinRoomViaToken = exports.getRoomById = exports.listMyRooms = exports.createRoom = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const room_model_1 = require("../models/room.model");
const user_model_1 = require("../models/user.model");
const session_model_1 = require("../models/session.model");
const replayFrame_model_1 = require("../models/replayFrame.model");
const jwt_1 = require("../utils/jwt");
const logger_1 = __importDefault(require("../utils/logger"));
const room_validation_1 = require("../middleware/validation/room.validation");
/**
 * POST /api/v1/rooms  (interviewer | admin only)
 *
 * Creates a new interview room.
 * - If no user exists for `candidateEmail`, a placeholder account is created
 *   so the invite link can be associated with a user record from day one.
 * - An invite token (24 h JWT) is generated and saved on the room.
 */
const createRoom = async (req, res) => {
    try {
        const validatedData = room_validation_1.createRoomSchema.parse(req.body);
        const interviewerId = req.user.id;
        let candidate = await user_model_1.User.findOne({ email: validatedData.candidateEmail });
        if (!candidate) {
            candidate = await user_model_1.User.create({
                email: validatedData.candidateEmail,
                role: 'candidate',
                name: validatedData.candidateEmail.split('@')[0],
                passwordHash: 'placeholder',
            });
        }
        const room = await room_model_1.InterviewRoom.create({
            title: validatedData.title,
            description: validatedData.description,
            interviewer: interviewerId,
            candidate: candidate._id,
            scheduledAt: validatedData.scheduledAt,
            durationMinutes: validatedData.durationMinutes,
            problemStatement: validatedData.problemStatement,
            mode: validatedData.mode || 'live',
            questionId: validatedData.questionId,
            techStack: validatedData.techStack,
            difficultyLevel: validatedData.difficultyLevel,
        });
        // Generate a signed invite token that encodes the room ID for the candidate
        room.inviteToken = (0, jwt_1.generateInviteToken)(room._id);
        // Token expires when the scheduled session window closes
        room.inviteExpiresAt = new Date(new Date(validatedData.scheduledAt).getTime() + validatedData.durationMinutes * 60000);
        await room.save();
        res.status(201).json({ success: true, data: room });
    }
    catch (error) {
        logger_1.default.error('Error creating room', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to create room' });
    }
};
exports.createRoom = createRoom;
/**
 * GET /api/v1/rooms  (authenticated)
 *
 * Returns all rooms where the calling user is the interviewer or candidate,
 * sorted by most recent scheduled time.
 */
const listMyRooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const query = role === 'interviewer' ? { interviewer: userId } : { candidate: userId };
        const rooms = await room_model_1.InterviewRoom.find(query)
            .populate('interviewer', 'name email avatar')
            .populate('candidate', 'name email avatar')
            .sort({ scheduledAt: -1 });
        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    }
    catch (error) {
        logger_1.default.error('Error fetching rooms', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.listMyRooms = listMyRooms;
/**
 * GET /api/v1/rooms/:roomId  (authenticated)
 *
 * Returns full room details.  Accepts both the MongoDB _id and the
 * UUID `roomId` field so that Socket.IO room names can be used as well.
 * Only the interviewer, candidate, or an admin may view a room.
 */
const getRoomById = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        // Accept both Mongo ObjectId and UUID roomId (used as Socket.IO channel)
        const query = mongoose_1.default.Types.ObjectId.isValid(roomId) ? { _id: roomId } : { roomId };
        const room = await room_model_1.InterviewRoom.findOne(query)
            .populate('interviewer', 'name email avatar')
            .populate('candidate', 'name email avatar');
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        if (!room.whiteboardKey) {
            const secureKey = crypto_1.default.randomBytes(32).toString('hex');
            await room_model_1.InterviewRoom.updateOne({ _id: room._id }, { whiteboardKey: secureKey });
            room.whiteboardKey = secureKey;
        }
        const interviewerId = room.interviewer?._id?.toString() || room.interviewer?.toString();
        const candidateId = room.candidate?._id?.toString() || room.candidate?.toString();
        const isInterviewer = interviewerId === req.user.id;
        const isCandidate = candidateId === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isInterviewer && !isCandidate && !isAdmin) {
            res.status(403).json({ success: false, message: 'Not authorized to access this room' });
            return;
        }

        // Auto-start session for scheduled rooms when the interviewer accesses it
        if (isInterviewer && room.status === 'scheduled') {
            try {
                room.status = 'active';
                await room.save();
                await session_model_1.InterviewSession.create({
                    room: room._id,
                    startTime: new Date(),
                });
                logger_1.default.info(`Session auto-started for room ${room.roomId} / ${room._id}`);
            } catch (startError) {
                logger_1.default.error(`Failed to auto-start session for room ${room._id}`, startError);
            }
        }

        res.status(200).json({ success: true, data: room });
    }
    catch (error) {
        logger_1.default.error('Error fetching room details', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getRoomById = getRoomById;
/**
 * GET /api/v1/rooms/join/:inviteToken  (authenticated)
 *
 * Resolves an invite token to the room's full document so the candidate
 * can be redirected to the correct room page after clicking their email link.
 * Returns 400 if the token has expired.
 */
const joinRoomViaToken = async (req, res) => {
    try {
        const { inviteToken } = req.params;
        const room = await room_model_1.InterviewRoom.findOne({ inviteToken })
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
    }
    catch (error) {
        logger_1.default.error('Error joining room', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.joinRoomViaToken = joinRoomViaToken;
/**
 * POST /api/v1/rooms/:roomId/start  (interviewer only)
 *
 * Transitions the room from 'scheduled' to 'active' and creates an
 * InterviewSession document to begin recording activity.
 */
const startSession = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const query = mongoose_1.default.Types.ObjectId.isValid(roomId) ? { _id: roomId } : { roomId };
        const room = await room_model_1.InterviewRoom.findOne(query);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        if (room.interviewer.toString() !== req.user.id) {
            res.status(403).json({ success: false, message: 'Only the interviewer can start the session' });
            return;
        }
        if (room.status !== 'scheduled') {
            res.status(400).json({ success: false, message: `Cannot start session — room is currently '${room.status}'` });
            return;
        }
        room.status = 'active';
        await room.save();
        const session = await session_model_1.InterviewSession.create({
            room: room._id,
            startTime: new Date(),
        });
        res.status(200).json({ success: true, data: session });
    }
    catch (error) {
        logger_1.default.error('Error starting session', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.startSession = startSession;
/**
 * POST /api/v1/rooms/:roomId/end  (interviewer only)
 *
 * Transitions the room to 'completed', finds the in-progress session, and
 * records its end time + computed duration in seconds.
 */
const endSession = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const query = mongoose_1.default.Types.ObjectId.isValid(roomId) ? { _id: roomId } : { roomId };
        const room = await room_model_1.InterviewRoom.findOne(query);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        if (room.interviewer.toString() !== req.user.id) {
            res.status(403).json({ success: false, message: 'Only the interviewer can end the session' });
            return;
        }
        if (room.status !== 'active') {
            res.status(400).json({ success: false, message: `Cannot end session — room is currently '${room.status}'` });
            return;
        }
        room.status = 'completed';
        await room.save();
        const session = await session_model_1.InterviewSession.findOne({
            room: room._id,
            endTime: { $exists: false },
        }).sort({ startTime: -1 });
        if (session) {
            session.endTime = new Date();
            session.durationSeconds = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
            await session.save();
        }
        res.status(200).json({ success: true, data: session });
    }
    catch (error) {
        logger_1.default.error('Error ending session', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.endSession = endSession;
/**
 * PATCH /api/v1/rooms/:roomId  (interviewer | admin)
 *
 * Partially updates room metadata (title, schedule, problem, etc.).
 * Only allowed while the room is still in 'scheduled' status to prevent
 * mid-session confusion.
 */
const updateRoom = async (req, res) => {
    try {
        const validatedData = room_validation_1.updateRoomSchema.parse(req.body);
        const roomId = req.params.roomId;
        const query = mongoose_1.default.Types.ObjectId.isValid(roomId) ? { _id: roomId } : { roomId };
        const room = await room_model_1.InterviewRoom.findOne(query);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        if (room.interviewer.toString() !== req.user?.id && req.user?.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Not authorized to update this room' });
            return;
        }
        if (room.status !== 'scheduled') {
            res.status(400).json({ success: false, message: 'Can only update rooms in scheduled status' });
            return;
        }
        Object.assign(room, validatedData);
        await room.save();
        res.status(200).json({ success: true, data: room });
    }
    catch (error) {
        logger_1.default.error('Error updating room', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to update room' });
    }
};
exports.updateRoom = updateRoom;
/**
 * POST /api/v1/rooms/:roomId/cancel  (interviewer | admin)
 *
 * Cancels a room that hasn't finished yet.
 * Cannot cancel a room that is already 'completed' or 'cancelled'.
 */
const cancelRoom = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const query = mongoose_1.default.Types.ObjectId.isValid(roomId) ? { _id: roomId } : { roomId };
        const room = await room_model_1.InterviewRoom.findOne(query);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        if (room.interviewer.toString() !== req.user?.id && req.user?.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Not authorized to cancel this room' });
            return;
        }
        if (room.status === 'completed' || room.status === 'cancelled') {
            res.status(400).json({ success: false, message: `Cannot cancel — room is already '${room.status}'` });
            return;
        }
        room.status = 'cancelled';
        await room.save();
        res.status(200).json({ success: true, message: 'Room cancelled', data: room });
    }
    catch (error) {
        logger_1.default.error('Error cancelling room', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.cancelRoom = cancelRoom;

/**
 * GET /api/v1/rooms/:roomId/replay
 *
 * Retrieves all replay frames recorded for this room.
 * Accessible to any authorized room participant (interviewer, candidate, admin).
 */
const getReplayFrames = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const query = mongoose_1.default.Types.ObjectId.isValid(roomId) ? { _id: roomId } : { roomId };
        const room = await room_model_1.InterviewRoom.findOne(query);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        const interviewerId = room.interviewer?._id?.toString() || room.interviewer?.toString();
        const candidateId = room.candidate?._id?.toString() || room.candidate?.toString();
        const isInterviewer = interviewerId === req.user.id;
        const isCandidate = candidateId === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isInterviewer && !isCandidate && !isAdmin) {
            res.status(403).json({ success: false, message: 'Not authorized to access this room\'s replay' });
            return;
        }
        const frames = await replayFrame_model_1.ReplayFrame.find({ roomId: room.roomId })
            .sort({ timestamp: 1 })
            .lean();
        res.status(200).json({ success: true, data: frames });
    }
    catch (error) {
        logger_1.default.error('Error fetching replay frames', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getReplayFrames = getReplayFrames;

