/**
 * models/codeSnapshot.model.ts
 *
 * Mongoose model for code snapshots taken during an interview session.
 *
 * Snapshots are captured in two ways:
 *  - 'auto'   : triggered by the editor on a configurable interval
 *  - 'manual' : triggered when the user explicitly runs the code (execute endpoint)
 *
 * When a snapshot is created via the execution endpoint, the `executionResult`
 * sub-document is populated with Judge0 output so the interviewer can review
 * both the code and its runtime output in the feedback view.
 */
const mongoose = require("mongoose");
const codeSnapshotSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession', required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    triggeredBy: {
        type: String,
        enum: ['auto', 'manual'],
        default: 'auto',
    },
    savedAt: { type: Date, default: Date.now, index: true },
    executionResult: {
        stdout: { type: String },
        stderr: { type: String },
        time: { type: String },
        memory: { type: Number },
    },
}, {
    timestamps: true,
});
exports.CodeSnapshot = mongoose.model('CodeSnapshot', codeSnapshotSchema);
