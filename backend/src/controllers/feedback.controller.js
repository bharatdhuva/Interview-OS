"use strict";
/**
 * controllers/feedback.controller.ts
 *
 * Interview feedback handlers.
 *
 * Endpoints:
 *  POST   /api/v1/feedback              — submitFeedback
 *  GET    /api/v1/feedback/:roomId      — getFeedbackForRoom
 *  PATCH  /api/v1/feedback/:roomId/share — shareFeedbackWithCandidate
 *
 * Visibility model:
 *  - Only the interviewer can submit and share feedback.
 *  - The candidate can read feedback only after the interviewer shares it.
 *  - Admins can always read all feedback.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareFeedbackWithCandidate = exports.getFeedbackForRoom = exports.submitFeedback = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const feedback_model_1 = require("../models/feedback.model");
const room_model_1 = require("../models/room.model");
const session_model_1 = require("../models/session.model");
const logger_1 = __importDefault(require("../utils/logger"));
const feedback_validation_1 = require("../middleware/validation/feedback.validation");
/**
 * POST /api/v1/feedback  (interviewer only)
 *
 * Submits structured feedback for a completed interview.
 * - Copies the session’s violation log into the feedback document so HR
 *   has an immutable proctoring snapshot even if the session is purged.
 * - Feedback is private until the interviewer explicitly calls /share.
 */
const submitFeedback = async (req, res) => {
    try {
        const validatedData = feedback_validation_1.submitFeedbackSchema.parse(req.body);
        const roomQuery = mongoose_1.default.Types.ObjectId.isValid(validatedData.roomId) ? { _id: validatedData.roomId } : { roomId: validatedData.roomId };
        const room = await room_model_1.InterviewRoom.findOne(roomQuery);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        // Only the room’s interviewer may submit feedback
        if (room.interviewer.toString() !== req.user.id) {
            res.status(403).json({ success: false, message: 'Only interviewer can submit feedback' });
            return;
        }
        // Snapshot the violation log from the session at submission time
        const session = await session_model_1.InterviewSession.findById(validatedData.sessionId);
        const proctoringViolations = session?.violationLog?.length ? session.violationLog : null;
        const feedback = await feedback_model_1.Feedback.create({
            room: room._id,
            session: validatedData.sessionId,
            interviewer: req.user.id,
            candidate: room.candidate,
            ratings: validatedData.ratings,
            strengths: validatedData.strengths,
            improvements: validatedData.improvements,
            overallNotes: validatedData.overallNotes,
            recommendation: validatedData.recommendation,
            proctoringViolations,
        });
        res.status(201).json({ success: true, data: feedback });
    }
    catch (error) {
        logger_1.default.error('Error submitting feedback', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to submit feedback' });
    }
};
exports.submitFeedback = submitFeedback;
/**
 * GET /api/v1/feedback/:roomId
 *
 * Returns the feedback document for a room.
 * - Candidates may only read it once `isSharedWithCandidate` is true.
 * - Interviewers and admins always have access.
 */
const getFeedbackForRoom = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const roomQuery = mongoose_1.default.Types.ObjectId.isValid(roomId) ? { _id: roomId } : { roomId };
        const room = await room_model_1.InterviewRoom.findOne(roomQuery);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        const feedback = await feedback_model_1.Feedback.findOne({ room: room._id })
            .populate('interviewer', 'name avatar')
            .populate('candidate', 'name avatar');
        if (!feedback) {
            res.status(404).json({ success: false, message: 'Feedback not found' });
            return;
        }
        const isCandidate = feedback.candidate._id.toString() === req.user.id;
        const isInterviewer = feedback.interviewer._id.toString() === req.user.id;
        // Block candidates from reading until the interviewer shares
        if (isCandidate && !feedback.isSharedWithCandidate) {
            res.status(403).json({ success: false, message: 'Feedback has not been shared with the candidate yet' });
            return;
        }
        // Only the two participants + admins have any access at all
        if (!isCandidate && !isInterviewer && req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Not authorized to view this feedback' });
            return;
        }
        res.status(200).json({ success: true, data: feedback });
    }
    catch (error) {
        logger_1.default.error('Error fetching feedback', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getFeedbackForRoom = getFeedbackForRoom;
/**
 * PATCH /api/v1/feedback/:roomId/share  (interviewer only)
 *
 * Flips the `isSharedWithCandidate` flag to true, granting the candidate
 * read access to the feedback document.
 */
const shareFeedbackWithCandidate = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const roomQuery = mongoose_1.default.Types.ObjectId.isValid(roomId) ? { _id: roomId } : { roomId };
        const room = await room_model_1.InterviewRoom.findOne(roomQuery);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        const feedback = await feedback_model_1.Feedback.findOne({ room: room._id });
        if (!feedback) {
            res.status(404).json({ success: false, message: 'Feedback not found' });
            return;
        }
        if (feedback.interviewer.toString() !== req.user.id) {
            res.status(403).json({ success: false, message: 'Only interviewer can share feedback' });
            return;
        }
        feedback.isSharedWithCandidate = true;
        await feedback.save();
        res.status(200).json({ success: true, message: 'Feedback shared successfully' });
    }
    catch (error) {
        logger_1.default.error('Error sharing feedback', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.shareFeedbackWithCandidate = shareFeedbackWithCandidate;
