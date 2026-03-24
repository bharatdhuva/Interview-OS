"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewSession = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const interviewSessionSchema = new mongoose_1.Schema({
    room: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    durationSeconds: { type: Number }, // set when endTime is recorded
    // Final editor state captured at session end
    finalCode: { type: String },
    finalLanguage: { type: String },
    // References to individual code execution snapshots
    codeSnapshots: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'CodeSnapshot' }],
    // Persisted Excalidraw canvas (Mixed allows arbitrary JSON shape)
    whiteboardSnapshot: { type: mongoose_1.Schema.Types.Mixed },
    recordingUrl: { type: String },
    // Audit log of socket connection events
    connectionLog: [
        {
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
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
exports.InterviewSession = mongoose_1.default.model('InterviewSession', interviewSessionSchema);
