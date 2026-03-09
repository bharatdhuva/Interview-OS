import { Server, Socket } from 'socket.io';
import logger from '../utils/logger';
import { InterviewSession } from '../models/session.model';
import registerCodeHandlers from './handlers/code.handler';
import registerWhiteboardHandlers from './handlers/whiteboard.handler';
import registerProctorHandlers from './handlers/proctor.handler';
import registerRtcHandlers from './handlers/rtc.handler';
import registerChatHandlers from './handlers/chat.handler';

// Track socket → { roomId, userId } for disconnect handling
const socketRoomMap = new Map<string, { roomId: string; userId: string }>();

const logToSession = async (roomId: string, userId: string, event: 'joined' | 'left' | 'disconnected' | 'reconnected') => {
  try {
    const session = await InterviewSession.findOne({ room: roomId, endTime: { $exists: false } });
    if (session) {
      session.connectionLog.push({ userId: userId as any, event, timestamp: new Date() });
      await session.save();
    }
  } catch (error) {
    logger.error(`Error logging ${event} to session`, error);
  }
};

export const initSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('room:join', async ({ roomId, userId, role }: { roomId: string; userId: string; role: string }) => {
      socket.join(roomId);
      socketRoomMap.set(socket.id, { roomId, userId });
      logger.info(`User ${userId} joined room ${roomId}`);
      socket.to(roomId).emit('room:user-joined', { userId, role });
      await logToSession(roomId, userId, 'joined');
    });

    socket.on('room:leave', async ({ roomId, userId }: { roomId: string; userId: string }) => {
      socket.leave(roomId);
      socketRoomMap.delete(socket.id);
      socket.to(roomId).emit('room:user-left', { userId });
      logger.info(`User ${userId} left room ${roomId}`);
      await logToSession(roomId, userId, 'left');
    });

    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      const info = socketRoomMap.get(socket.id);
      if (info) {
        socket.to(info.roomId).emit('room:user-left', { userId: info.userId });
        await logToSession(info.roomId, info.userId, 'disconnected');
        socketRoomMap.delete(socket.id);
      }
    });

    registerCodeHandlers(io, socket);
    registerWhiteboardHandlers(io, socket);
    registerProctorHandlers(io, socket);
    registerRtcHandlers(io, socket);
    registerChatHandlers(io, socket);
  });
};
