"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemAnalytics = exports.forceEndRoom = exports.getAllRooms = exports.deleteUser = exports.changeUserRole = exports.getAllUsers = void 0;
const user_model_1 = require("../models/user.model");
const room_model_1 = require("../models/room.model");
const session_model_1 = require("../models/session.model");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * GET /api/v1/admin/users?page=1&limit=20
 *
 * Paginated list of all platform users (sorted newest first).
 * Sensitive fields (passwordHash, refreshTokens) are never returned.
 */
const getAllUsers = async (req, res) => {
    try {
        // Parse pagination query params with sensible defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const users = await user_model_1.User.find()
            .select('-passwordHash -refreshTokens')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await user_model_1.User.countDocuments();
        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: users,
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching users (Admin)', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllUsers = getAllUsers;
/**
 * PATCH /api/v1/admin/users/:id/role
 *
 * Updates a user’s role.  Validates that the supplied role is one of
 * the three allowed values before persisting.
 */
const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['candidate', 'interviewer', 'admin'].includes(role)) {
            res.status(400).json({ success: false, message: 'Invalid role' });
            return;
        }
        const user = await user_model_1.User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-passwordHash -refreshTokens');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        logger_1.default.error('Error changing user role', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.changeUserRole = changeUserRole;
/**
 * DELETE /api/v1/admin/users/:id
 *
 * Hard-deletes a user account.  Note: associated rooms / sessions are NOT
 * cascade-deleted; consider a soft-delete / archiving strategy for production.
 */
const deleteUser = async (req, res) => {
    try {
        const user = await user_model_1.User.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
    catch (error) {
        logger_1.default.error('Error deleting user', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteUser = deleteUser;
/**
 * GET /api/v1/admin/rooms
 *
 * Returns all interview rooms on the platform (populated with user info),
 * sorted by most recent scheduled time.
 */
const getAllRooms = async (req, res) => {
    try {
        const rooms = await room_model_1.InterviewRoom.find()
            .populate('interviewer', 'name email avatar')
            .populate('candidate', 'name email avatar')
            .sort({ scheduledAt: -1 });
        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    }
    catch (error) {
        logger_1.default.error('Error fetching all rooms (Admin)', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllRooms = getAllRooms;
/**
 * POST /api/v1/admin/rooms/:id/force-end
 *
 * Administratively terminates an active room, closes the in-progress
 * session, and marks the proctoring result as 'terminated'.
 * Used when a session must be stopped from the admin dashboard.
 */
const forceEndRoom = async (req, res) => {
    try {
        const room = await room_model_1.InterviewRoom.findById(req.params.id);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        room.status = 'completed';
        await room.save();
        // Close the most recent open session if one exists
        const session = await session_model_1.InterviewSession.findOne({
            room: room._id,
            endTime: { $exists: false },
        }).sort({ startTime: -1 });
        if (session) {
            session.endTime = new Date();
            session.durationSeconds = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
            session.proctoringResult = 'terminated'; // flag forced termination
            await session.save();
        }
        res.status(200).json({ success: true, message: 'Room forcefully ended' });
    }
    catch (error) {
        logger_1.default.error('Error force ending room', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.forceEndRoom = forceEndRoom;
/**
 * GET /api/v1/admin/analytics
 *
 * Returns high-level platform statistics in a single response by running
 * four count queries in parallel with Promise.all for efficiency.
 */
const getSystemAnalytics = async (req, res) => {
    try {
        // Run all count queries concurrently to minimise response time
        const [totalUsers, totalRooms, completedRooms, activeRooms] = await Promise.all([
            user_model_1.User.countDocuments(),
            room_model_1.InterviewRoom.countDocuments(),
            room_model_1.InterviewRoom.countDocuments({ status: 'completed' }),
            room_model_1.InterviewRoom.countDocuments({ status: 'active' }),
        ]);
        res.status(200).json({
            success: true,
            data: { totalUsers, totalRooms, completedRooms, activeRooms },
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching system analytics', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getSystemAnalytics = getSystemAnalytics;
