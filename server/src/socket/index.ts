/**
 * socket/index.ts
 *
 * Socket.IO initialisation and core room-lifecycle event handling.
 *
 * Architecture
 * ─────────────
 * • `initSocket(io)` is the single entry point called from server.ts.
 * • Feature-specific events are split into dedicated handler modules that are
 *   registered once per socket connection:
 *     - chat.handler     → chat:message, chat:typing
 *     - code.handler     → code:change, code:cursor, code:language
 *     - whiteboard.handler → whiteboard:change, whiteboard:clear, sync
 *     - proctor.handler  → proctor:warning
 *     - rtc.handler      → rtc:offer, rtc:answer, rtc:ice-candidate
 *
 * Room lifecycle events handled here:
 *   CLIENT → SERVER
 *     room:join              — subscribe socket to the roomId Socket.IO room
 *     room:leave             — unsubscribe socket explicitly
 *     disconnect             — implicit leave on network drop
 *
 *   SERVER → ROOM
 *     room:user-joined       — broadcast to peers when someone joins
 *     room:user-left         — broadcast to peers when someone leaves
 */

import { Server, Socket } from 'socket.io';
import logger from '../utils/logger';
import { InterviewSession } from '../models/session.model';
import registerCodeHandlers from './handlers/code.handler';
import registerWhiteboardHandlers from './handlers/whiteboard.handler';
import registerProctorHandlers from './handlers/proctor.handler';
import registerRtcHandlers from './handlers/rtc.handler';
import registerChatHandlers from './handlers/chat.handler';

/**
 * socketRoomMap
 *
 * In-memory map from socket.id to { roomId, userId }.
 * Used during `disconnect` events to broadcast departure and log
 * to the session even when the client does not emit `room:leave` first.
 */
const socketRoomMap = new Map<string, { roomId: string; userId: string }>();

/**
 * logToSession
 *
 * Appends a connection lifecycle event to the active InterviewSession for
 * the given room. Silently no-ops when no active session exists (e.g. the
 * room hasn't been started yet).
 *
 * @param roomId  - The room identifier that maps to InterviewSession.room
 * @param userId  - The MongoDB ObjectId string of the participant
 * @param event   - Connection lifecycle label (joined | left | disconnected | reconnected)
 */
const logToSession = async (
  roomId: string,
  userId: string,
  event: 'joined' | 'left' | 'disconnected' | 'reconnected',
): Promise<void> => {
  try {
    // Find the in-progress session (one with no endTime) for this room
    const session = await InterviewSession.findOne({ room: roomId, endTime: { $exists: false } });
    if (session) {
      session.connectionLog.push({ userId: userId as any, event, timestamp: new Date() });
      await session.save();
    }
  } catch (error) {
    logger.error(`Error logging ${event} to session`, error);
  }
};

/**
 * initSocket
 *
 * Attaches Socket.IO event handlers to the provided server instance.
 * Should be called once at startup after the HTTP server is created.
 *
 * @param io - The Socket.IO Server instance
 */
export const initSocket = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // ── room:join ────────────────────────────────────────────────────────────
    // Subscribes this socket to the Socket.IO room channel (roomId) so it
    // receives all subsequent broadcasts targeted at that room.
    socket.on(
      'room:join',
      async ({ roomId, userId, role }: { roomId: string; userId: string; role: string }) => {
        socket.join(roomId);
        socketRoomMap.set(socket.id, { roomId, userId });
        logger.info(`User ${userId} joined room ${roomId}`);
        // Notify all other participants in the room
        socket.to(roomId).emit('room:user-joined', { userId, role });
        await logToSession(roomId, userId, 'joined');
      },
    );

    // ── room:leave ───────────────────────────────────────────────────────────
    // Explicit leave — client navigates away or clicks "Leave".
    socket.on(
      'room:leave',
      async ({ roomId, userId }: { roomId: string; userId: string }) => {
        socket.leave(roomId);
        socketRoomMap.delete(socket.id);
        socket.to(roomId).emit('room:user-left', { userId });
        logger.info(`User ${userId} left room ${roomId}`);
        await logToSession(roomId, userId, 'left');
      },
    );

    // ── disconnect ───────────────────────────────────────────────────────────
    // Implicit disconnect (browser closed, network dropped, etc.).
    // Use socketRoomMap to reconstruct room context without client data.
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      const info = socketRoomMap.get(socket.id);
      if (info) {
        socket.to(info.roomId).emit('room:user-left', { userId: info.userId });
        await logToSession(info.roomId, info.userId, 'disconnected');
        socketRoomMap.delete(socket.id);
      }
    });

    // ── Feature handler registration ─────────────────────────────────────────
    // Each module binds its own socket events independently, keeping this
    // file focused solely on room lifecycle management.
    registerCodeHandlers(io, socket);
    registerWhiteboardHandlers(io, socket);
    registerProctorHandlers(io, socket);
    registerRtcHandlers(io, socket);
    registerChatHandlers(io, socket);
  });
};
