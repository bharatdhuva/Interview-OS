/**
 * models/session.model.ts
 *
 * Mongoose model for an interview session.
 *
 * A session is created when the interviewer hits /start and closed when they
 * hit /end.  One room can technically have several sessions (e.g. reconnect
 * after a crash), but in normal flow there is exactly one active session per
 * room at a time.
 *
 * Key sub-documents:
 *  - connectionLog  : timestamped join/leave events per user (audit trail)
 *  - violationLog   : proctoring events — tab-switches, fullscreen exits, etc.
 *  - codeSnapshots  : refs to CodeSnapshot documents created during the session
 *  - whiteboardSnapshot : persisted Excalidraw state (Mixed schema for flexibility)
 */
const mongoose = require("mongoose");
const interviewSessionSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    durationSeconds: { type: Number }, // set when endTime is recorded
    // Final editor state captured at session end
    finalCode: { type: String },
    finalLanguage: { type: String },
    // References to individual code execution snapshots
    codeSnapshots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CodeSnapshot' }],
    // Persisted Excalidraw canvas (Mixed allows arbitrary JSON shape)
    whiteboardSnapshot: { type: mongoose.Schema.Types.Mixed },
    recordingUrl: { type: String },
    // Audit log of socket connection events
    connectionLog: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            event: { type: String, enum: ['joined', 'left', 'disconnected', 'reconnected'] },
            timestamp: { type: Date, default: Date.now },
        },
    ],
    // Proctoring events emitted by the frontend proctor hook
    violationLog: [
        {
            type: {
                type: String,
                required: true,
                enum: [
                    'fullscreen_exit',
                    'tab_switch',
                    'window_blur',
                    'paste_attempt',
                    'suspicious_paste',
                    'no_face_detected',
                    'multiple_faces',
                ],
            },
            timestamp: { type: Date, default: Date.now },
            count: { type: Number, default: 1 }, // incremented on repeated violations
        },
    ],
    // Summary verdict written at session end (or on auto-termination)
    proctoringResult: {
        type: String,
        enum: ['clean', 'warned', 'terminated'],
        default: 'clean',
    },
}, {
    timestamps: true,
});
exports.InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
