"use strict";
/**
 * socket/handlers/proctor.handler.ts
 *
 * Handles automated proctoring events during an interview session.
 *
 * Violation flow:
 *   1. Client (candidate tab) detects a suspicious activity (tab-switch,
 *      camera loss, gaze deviation, etc.) and emits `proctor:warning`.
 *   2. This handler:
 *      a. Logs the violation in the InterviewSession.violationLog.
 *      b. Broadcasts `proctor:alert` to the interviewer in real-time.
 *      c. If cumulative violations reach MAX_VIOLATIONS, marks the session
 *         as `proctoringResult: 'terminated'` and emits `proctor:end-session`
 *         to all room participants, triggering the UI termination flow.
 *
 * Events handled (CLIENT → SERVER):
 *   proctor:warning  — a proctoring violation detected by the client
 *
 * Events emitted (SERVER → ROOM):
 *   proctor:alert        — real-time alert forwarded to the interviewer
 *   proctor:end-session  — session terminated due to MAX_VIOLATIONS exceeded
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../utils/logger"));
const session_model_1 = require("../../models/session.model");
/** Maximum number of violations allowed before the session is auto-terminated. */
const MAX_VIOLATIONS = 3;
exports.default = (io, socket) => {
    // ── proctor:warning ────────────────────────────────────────────────────────
    socket.on('proctor:warning', async ({ roomId, sessionId, type, count, timestamp, userId, }) => {
        logger_1.default.warn(`Proctoring alert in room ${roomId} by user ${userId} - ${type} (${count}/${MAX_VIOLATIONS})`);
        // Notify the interviewer in real-time (exclude the candidate's socket)
        socket.to(roomId).emit('proctor:alert', { type, count, timestamp, userId });
        try {
            // Persist the violation record to the session document
            await session_model_1.InterviewSession.findByIdAndUpdate(sessionId, {
                $push: { violationLog: { type, timestamp, count } },
            });
            // Auto-terminate when the violation threshold is breached
            if (count >= MAX_VIOLATIONS) {
                await session_model_1.InterviewSession.findByIdAndUpdate(sessionId, {
                    proctoringResult: 'terminated',
                });
                // Emit to ALL participants (io.to) so both sides see the termination
                io.to(roomId).emit('proctor:end-session', {
                    reason: 'Session automatically terminated due to repeated proctoring violations.',
                });
            }
        }
        catch (error) {
            logger_1.default.error('Failed to save proctoring violation', error);
        }
    });
};
