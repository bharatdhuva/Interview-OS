/**
 * models/feedback.model.ts
 *
 * Mongoose model for post-interview feedback.
 *
 * Submitted by the interviewer after the session ends.  The feedback is
 * private until the interviewer explicitly calls the /share endpoint, at
 * which point `isSharedWithCandidate` is flipped to true and the candidate
 * can read it via GET /api/v1/feedback/:roomId.
 */
const mongoose = require("mongoose");
const feedbackSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession', required: true },
    interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: {
        problemSolving: { type: Number, min: 1, max: 5, required: true },
        codeQuality: { type: Number, min: 1, max: 5, required: true },
        communication: { type: Number, min: 1, max: 5, required: true },
        efficiency: { type: Number, min: 1, max: 5, required: true },
    },
    strengths: { type: String },
    improvements: { type: String },
    overallNotes: { type: String },
    recommendation: {
        type: String,
        enum: ['strong_yes', 'yes', 'no', 'strong_no'],
        required: true,
    },
    // Copied from session.violationLog at submission time for an immutable record
    proctoringViolations: { type: mongoose.Schema.Types.Mixed },
    // Set to true when interviewer explicitly shares via PATCH /share
    isSharedWithCandidate: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});
exports.Feedback = mongoose.model('Feedback', feedbackSchema);
