import { Server, Socket } from 'socket.io';
import { InterviewSession } from '../../models/session.model';
import logger from '../../utils/logger';

export default (io: Server, socket: Socket) => {
  socket.on(
    'whiteboard:change',
    async ({ roomId, elements, appState }: { roomId: string; elements: any[]; appState: any }) => {
      socket.to(roomId).emit('whiteboard:change', { elements, appState });

      // Persist latest whiteboard state to session
      try {
        await InterviewSession.findOneAndUpdate(
          { room: roomId, endTime: { $exists: false } },
          { whiteboardSnapshot: { elements, appState, updatedAt: new Date() } }
        );
      } catch (error) {
        logger.error('Error persisting whiteboard state', error);
      }
    }
  );

  socket.on('whiteboard:clear', async ({ roomId }: { roomId: string }) => {
    socket.to(roomId).emit('whiteboard:clear');

    try {
      await InterviewSession.findOneAndUpdate(
        { room: roomId, endTime: { $exists: false } },
        { whiteboardSnapshot: { elements: [], appState: null, updatedAt: new Date() } }
      );
    } catch (error) {
      logger.error('Error clearing whiteboard in session', error);
    }
  });

  socket.on('whiteboard:sync_request', ({ roomId }: { roomId: string }) => {
    socket.to(roomId).emit('whiteboard:sync_request', { replyTo: socket.id });
  });

  socket.on(
    'whiteboard:sync_response',
    ({ replyTo, elements, appState }: { replyTo: string; elements: any[]; appState: any }) => {
      io.to(replyTo).emit('whiteboard:sync', { elements, appState });
    }
  );
};
