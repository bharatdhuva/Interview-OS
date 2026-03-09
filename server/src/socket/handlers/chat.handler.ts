import { Server, Socket } from 'socket.io';
import { ChatMessage } from '../../models/chatMessage.model';
import logger from '../../utils/logger';

export default (io: Server, socket: Socket) => {
  socket.on(
    'chat:message',
    async ({ roomId, senderId, message }: { roomId: string; senderId: string; message: string }) => {
      if (!roomId || !senderId || !message?.trim()) {
        return;
      }

      try {
        const chatMsg = await ChatMessage.create({
          room: roomId,
          sender: senderId,
          message: message.trim(),
          messageType: 'text',
        });
        io.to(roomId).emit('chat:message', chatMsg);
      } catch (error) {
        logger.error('Error saving chat message', error);
      }
    }
  );

  socket.on(
    'chat:typing',
    ({ roomId, userId, isTyping }: { roomId: string; userId: string; isTyping: boolean }) => {
      if (!roomId || !userId) return;
      socket.to(roomId).emit('chat:typing', { userId, isTyping });
    }
  );
};
