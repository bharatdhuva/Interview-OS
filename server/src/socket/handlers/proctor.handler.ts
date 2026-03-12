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

import { Server, Socket } from 'socket.io';
import logger from '../../utils/logger';
import { InterviewSession } from '../../models/session.model';

/** Maximum number of violations allowed before the session is auto-terminated. */
const MAX_VIOLATIONS = 3;

export default (io: Server, socket: Socket) => {
  // ── proctor:warning ────────────────────────────────────────────────────────
  socket.on(
    'proctor:warning',
    async ({
      roomId,
      sessionId,
      type,
      count,
      timestamp,
      userId,
    }: {
      roomId: string;
      sessionId: string;
      /** Violation category, e.g. 'tab-switch', 'camera-loss', 'face-not-detected' */
      type: string;
      /** Running violation count as tracked by the client */
      count: number;
      timestamp: Date;
      userId: string;
    }) => {
      logger.warn(
        `Proctoring alert in room ${roomId} by user ${userId} - ${type} (${count}/${MAX_VIOLATIONS})`,
      );

      // Notify the interviewer in real-time (exclude the candidate's socket)
      socket.to(roomId).emit('proctor:alert', { type, count, timestamp, userId });

      try {
        // Persist the violation record to the session document
        await InterviewSession.findByIdAndUpdate(sessionId, {
          $push: { violationLog: { type, timestamp, count } },
        });

        // Auto-terminate when the violation threshold is breached
        if (count >= MAX_VIOLATIONS) {
          await InterviewSession.findByIdAndUpdate(sessionId, {
            proctoringResult: 'terminated',
          });
          // Emit to ALL participants (io.to) so both sides see the termination
          io.to(roomId).emit('proctor:end-session', {
            reason: 'Session automatically terminated due to repeated proctoring violations.',
          });
        }
      } catch (error) {
        logger.error('Failed to save proctoring violation', error);
      }
    },
  );
};
