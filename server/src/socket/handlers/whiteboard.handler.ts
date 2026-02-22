import { Server, Socket } from 'socket.io';
import logger from '../../utils/logger';

export default (io: Server, socket: Socket) => {
  socket.on(
    'whiteboard:change',
    ({
      roomId,
      elements,
      appState,
    }: {
      roomId: string;
      elements: any[];
      appState: any;
    }) => {
      // Broadcast whiteboard updates to the room
      socket.to(roomId).emit('whiteboard:change', { elements, appState });
    }
  );

  socket.on('whiteboard:clear', ({ roomId }: { roomId: string }) => {
    socket.to(roomId).emit('whiteboard:clear');
  });

  socket.on('whiteboard:sync_request', ({ roomId }: { roomId: string }) => {
    // Forward the request to others so one can reply with their current state
    socket.to(roomId).emit('whiteboard:sync_request', { replyTo: socket.id });
  });

  socket.on(
    'whiteboard:sync_response',
    ({
      replyTo,
      elements,
      appState,
    }: {
      replyTo: string;
      elements: any[];
      appState: any;
    }) => {
      // Send the current whiteboard state directly to the requester
      io.to(replyTo).emit('whiteboard:sync', { elements, appState });
    }
  );
};
