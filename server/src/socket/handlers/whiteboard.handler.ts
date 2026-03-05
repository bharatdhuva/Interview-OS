import { Server, Socket } from 'socket.io';

export default (io: Server, socket: Socket) => {
  socket.on(
    'whiteboard:change',
    ({ roomId, elements, appState }: { roomId: string; elements: any[]; appState: any }) => {
      socket.to(roomId).emit('whiteboard:change', { elements, appState });
    }
  );

  socket.on('whiteboard:clear', ({ roomId }: { roomId: string }) => {
    socket.to(roomId).emit('whiteboard:clear');
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
