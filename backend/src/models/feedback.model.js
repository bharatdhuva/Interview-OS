"use strict";
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
exports.Feedback = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const feedbackSchema = new mongoose_1.Schema({
    room: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    session: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InterviewSession', required: true },
    interviewer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    candidate: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
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
    proctoringViolations: { type: mongoose_1.Schema.Types.Mixed },
    // Set to true when interviewer explicitly shares via PATCH /share
    isSharedWithCandidate: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});
exports.Feedback = mongoose_1.default.model('Feedback', feedbackSchema);
