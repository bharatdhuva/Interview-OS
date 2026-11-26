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
const mongoose = require("mongoose");
const feedbackModel = require("../models/feedback.model");
const roomModel = require("../models/room.model");
const sessionModel = require("../models/session.model");
const logger = require("../utils/logger");
const feedbackValidation = require("../middleware/validation/feedback.validation");
const { AiEvaluation } = require("../models/aiEvaluation.model");
const { runEvaluationPipeline } = require("../services/ai/evaluator");
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
        const validatedData = feedbackValidation.submitFeedbackSchema.parse(req.body);
        const roomQuery = mongoose.Types.ObjectId.isValid(validatedData.roomId) ? { _id: validatedData.roomId } : { roomId: validatedData.roomId };
        const room = await roomModel.InterviewRoom.findOne(roomQuery);
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
        const session = await sessionModel.InterviewSession.findById(validatedData.sessionId);
        const proctoringViolations = session?.violationLog?.length ? session.violationLog : null;
        const feedback = await feedbackModel.Feedback.create({
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
        logger.error('Error submitting feedback', error);
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
        const roomQuery = mongoose.Types.ObjectId.isValid(roomId) ? { _id: roomId } : { roomId };
        const room = await roomModel.InterviewRoom.findOne(roomQuery);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        const feedback = await feedbackModel.Feedback.findOne({ room: room._id })
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
        logger.error('Error fetching feedback', error);
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
        const roomQuery = mongoose.Types.ObjectId.isValid(roomId) ? { _id: roomId } : { roomId };
        const room = await roomModel.InterviewRoom.findOne(roomQuery);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        const feedback = await feedbackModel.Feedback.findOne({ room: room._id });
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
        logger.error('Error sharing feedback', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.shareFeedbackWithCandidate = shareFeedbackWithCandidate;

/**
 * POST /api/v1/feedback/:roomId/ai-draft  (interviewer only)
 *
 * Generates (or returns cached) AI evaluation draft for a completed interview.
 */
const generateAiDraft = async (req, res) => {
    try {
        const { async: runAsync, forceRegenerate } = feedbackValidation.generateAiDraftSchema.parse(req.body || {});
        const roomId = req.params.roomId;
        const roomQuery = mongoose.Types.ObjectId.isValid(roomId) ? { _id: roomId } : { roomId };
        const room = await roomModel.InterviewRoom.findOne(roomQuery);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        if (room.interviewer.toString() !== req.user.id) {
            res.status(403).json({ success: false, message: 'Only the room interviewer can generate an AI draft' });
            return;
        }
        if (room.status !== 'completed') {
            res.status(400).json({ success: false, message: 'AI evaluation is only available after the session is completed' });
            return;
        }
        const session = await sessionModel.InterviewSession.findOne({ room: room._id }).sort({ startTime: -1 });
        if (!session) {
            res.status(404).json({ success: false, message: 'No interview session found for this room' });
            return;
        }
        if (!forceRegenerate) {
            const existing = await AiEvaluation.findOne({
                room: room._id,
                session: session._id,
                status: { $in: ['pending', 'ready'] },
            }).sort({ createdAt: -1 });
            if (existing) {
                res.status(existing.status === 'pending' ? 202 : 200).json({ success: true, data: existing });
                return;
            }
        }
        const evaluation = await AiEvaluation.create({
            room: room._id,
            roomId: room.roomId,
            session: session._id,
            status: 'pending',
        });
        if (runAsync) {
            setImmediate(() => {
                runEvaluationPipeline({
                    evaluationId: evaluation._id,
                    room,
                    session,
                    userId: req.user.id,
                }).catch((err) => {
                    logger.error('Async AI evaluation failed', { roomId: room.roomId, error: err.message });
                });
            });
            res.status(202).json({ success: true, data: evaluation });
            return;
        }
        const completed = await runEvaluationPipeline({
            evaluationId: evaluation._id,
            room,
            session,
            userId: req.user.id,
        });
        res.status(200).json({ success: true, data: completed });
    }
    catch (error) {
        logger.error('Error generating AI draft', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to generate AI draft' });
    }
};
exports.generateAiDraft = generateAiDraft;

/**
 * GET /api/v1/feedback/:roomId/ai-draft  (interviewer only)
 *
 * Returns the latest AI evaluation draft (pending | ready | failed) for this room.
 */
const getAiDraft = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const roomQuery = mongoose.Types.ObjectId.isValid(roomId) ? { _id: roomId } : { roomId };
        const room = await roomModel.InterviewRoom.findOne(roomQuery);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        if (room.interviewer.toString() !== req.user.id) {
            res.status(403).json({ success: false, message: 'Only the room interviewer can view AI drafts' });
            return;
        }
        const draft = await AiEvaluation.findOne({ room: room._id }).sort({ createdAt: -1 });
        if (!draft) {
            res.status(404).json({ success: false, message: 'No AI draft found for this room' });
            return;
        }
        res.status(200).json({ success: true, data: draft });
    }
    catch (error) {
        logger.error('Error fetching AI draft', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAiDraft = getAiDraft;
