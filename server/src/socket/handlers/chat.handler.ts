import { Server, Socket } from 'socket.io';
import logger from '../../utils/logger';
import { ChatMessage } from '../../models/chatMessage.model';

export default (io: Server, socket: Socket) => {
  socket.on(
    'chat:message',
    async ({
      roomId,
      senderId,
      message,
    }: {
      roomId: string;
      senderId: string;
      message: string;
    }) => {
      const chatMsg = await ChatMessage.create({
        room: roomId,
        sender: senderId,
        message,
        messageType: 'text',
      });

      io.to(roomId).emit('chat:message', chatMsg);
    }
  );

  socket.on(
    'chat:typing',
    ({ roomId, userId, isTyping }: { roomId: string; userId: string; isTyping: boolean }) => {
      socket.to(roomId).emit('chat:typing', { userId, isTyping });
    }
  );
};
