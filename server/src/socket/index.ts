import { Server, Socket } from 'socket.io';
import logger from '../utils/logger';
import { InterviewSession } from '../models/session.model';
import registerCodeHandlers from './handlers/code.handler';
import registerWhiteboardHandlers from './handlers/whiteboard.handler';
import registerProctorHandlers from './handlers/proctor.handler';
import registerRtcHandlers from './handlers/rtc.handler';
import registerChatHandlers from './handlers/chat.handler';

export const initSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('room:join', async ({ roomId, userId, role }: { roomId: string; userId: string; role: string }) => {
      socket.join(roomId);
      logger.info(`User ${userId} joined room ${roomId}`);
      socket.to(roomId).emit('room:user-joined', { userId, role });

      try {
        const session = await InterviewSession.findOne({ room: roomId, endTime: { $exists: false } });
        if (session) {
          session.connectionLog.push({ userId: userId as any, event: 'joined', timestamp: new Date() });
          await session.save();
        }
      } catch (error) {
        logger.error('Error logging user join to session', error);
      }
    });

    socket.on('room:leave', ({ roomId, userId }: { roomId: string; userId: string }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('room:user-left', { userId });
      logger.info(`User ${userId} left room ${roomId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });

    registerCodeHandlers(io, socket);
    registerWhiteboardHandlers(io, socket);
    registerProctorHandlers(io, socket);
    registerRtcHandlers(io, socket);
    registerChatHandlers(io, socket);
  });
};
