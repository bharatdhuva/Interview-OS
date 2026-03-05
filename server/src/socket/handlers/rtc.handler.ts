import { Server, Socket } from 'socket.io';

export default (io: Server, socket: Socket) => {
  socket.on('rtc:user-ready', ({ roomId, userId }: { roomId: string; userId: string }) => {
    socket.to(roomId).emit('rtc:user-ready', { userId });
  });

  socket.on('rtc:offer', ({ to, offer, from }: { to: string; offer: any; from: string }) => {
    io.to(to).emit('rtc:offer', { offer, from });
  });

  socket.on('rtc:answer', ({ to, answer, from }: { to: string; answer: any; from: string }) => {
    io.to(to).emit('rtc:answer', { answer, from });
  });

  socket.on('rtc:ice-candidate', ({ to, candidate, from }: { to: string; candidate: any; from: string }) => {
    io.to(to).emit('rtc:ice-candidate', { candidate, from });
  });
};
