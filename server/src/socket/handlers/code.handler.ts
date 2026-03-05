import { Server, Socket } from 'socket.io';

export default (io: Server, socket: Socket) => {
  socket.on(
    'code:change',
    ({ roomId, delta, language }: { roomId: string; delta: any; language: string }) => {
      socket.to(roomId).emit('code:change', { delta, language, userId: socket.id });
    }
  );

  socket.on(
    'code:cursor',
    ({ roomId, userId, position, name, color }: { roomId: string; userId: string; position: any; name: string; color: string }) => {
      socket.to(roomId).emit('code:cursor', { userId, position, name, color });
    }
  );

  socket.on(
    'code:language',
    ({ roomId, language }: { roomId: string; language: string }) => {
      socket.to(roomId).emit('code:language', { language });
    }
  );
};
