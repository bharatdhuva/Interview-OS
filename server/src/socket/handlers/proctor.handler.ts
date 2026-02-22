import { Server, Socket } from 'socket.io';
import logger from '../../utils/logger';
import { InterviewSession } from '../../models/session.model';

export default (io: Server, socket: Socket) => {
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
      type: string;
      count: number;
      timestamp: Date;
      userId: string;
    }) => {
      logger.warn(`📸 Proctoring alert in room ${roomId} by user ${userId} - ${type} (${count}/3)`);

      // Alert the interviewer in real-time
      socket.to(roomId).emit('proctor:alert', { type, count, timestamp, userId });

      // Save to database
      try {
        await InterviewSession.findByIdAndUpdate(sessionId, {
          $push: {
            violationLog: { type, timestamp, count },
          },
        });

        // 3 strikes: Auto end the session
        if (count >= 3) {
          await InterviewSession.findByIdAndUpdate(sessionId, {
            proctoringResult: 'terminated',
          });
          io.to(roomId).emit('proctor:end-session', {
            reason: 'Session automatically terminated due to repeated proctoring violations.',
          });
        }
      } catch (error) {
        logger.error('Failed to save proctoring violation:', error);
      }
    }
  );
};
