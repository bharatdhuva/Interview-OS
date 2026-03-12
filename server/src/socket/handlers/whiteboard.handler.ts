/**
 * socket/handlers/whiteboard.handler.ts
 *
 * Handles collaborative whiteboard events, backed by Excalidraw on the client.
 *
 * Persistence strategy:
 *   The full Excalidraw scene (elements array + appState) is upserted into
 *   InterviewSession.whiteboardSnapshot on every `whiteboard:change` and
 *   `whiteboard:clear` event. This allows the board to be restored if a
 *   participant reconnects mid-session.
 *
 * Late-join sync flow:
 *   A newcomer cannot receive past `whiteboard:change` events (they’re not
 *   replayed by Socket.IO). Instead:
 *     1. New client emits `whiteboard:sync_request`.
 *     2. Server relays it to existing peers with the requester’s socket.id
 *        as `replyTo`.
 *     3. An existing peer responds with `whiteboard:sync_response` containing
 *        the current scene.
 *     4. Server forwards the scene exclusively to the requesting socket via
 *        `whiteboard:sync`.
 *
 * Events handled (CLIENT → SERVER):
 *   whiteboard:change        — Excalidraw scene update (elements + appState)
 *   whiteboard:clear         — reset the board to empty
 *   whiteboard:sync_request  — request current scene from peers (late-join)
 *   whiteboard:sync_response — a peer replies with their scene
 *
 * Events emitted (SERVER → ...):
 *   whiteboard:change        — broadcast to room peers
 *   whiteboard:clear         — broadcast to room peers
 *   whiteboard:sync_request  — broadcast to room peers (includes replyTo)
 *   whiteboard:sync          — unicast scene back to the requesting socket
 */

import { Server, Socket } from 'socket.io';
import { InterviewSession } from '../../models/session.model';
import logger from '../../utils/logger';

export default (io: Server, socket: Socket) => {
  // ── whiteboard:change ──────────────────────────────────────────────────────
  // Forward the updated Excalidraw scene to peers and persist to the session.
  socket.on(
    'whiteboard:change',
    async ({ roomId, elements, appState }: { roomId: string; elements: any[]; appState: any }) => {
      // Relay to all other participants in the room
      socket.to(roomId).emit('whiteboard:change', { elements, appState });

      // Persist latest whiteboard state to session for reconnect recovery
      try {
        await InterviewSession.findOneAndUpdate(
          { room: roomId, endTime: { $exists: false } },
          { whiteboardSnapshot: { elements, appState, updatedAt: new Date() } },
        );
      } catch (error) {
        logger.error('Error persisting whiteboard state', error);
      }
    },
  );

  // ── whiteboard:clear ───────────────────────────────────────────────────────
  // Reset the board for all participants and wipe the persisted snapshot.
  socket.on('whiteboard:clear', async ({ roomId }: { roomId: string }) => {
    socket.to(roomId).emit('whiteboard:clear');

    try {
      await InterviewSession.findOneAndUpdate(
        { room: roomId, endTime: { $exists: false } },
        { whiteboardSnapshot: { elements: [], appState: null, updatedAt: new Date() } },
      );
    } catch (error) {
      logger.error('Error clearing whiteboard in session', error);
    }
  });

  // ── whiteboard:sync_request ────────────────────────────────────────────────
  // A newly joined (or reconnected) participant asks existing peers for the
  // current scene. Server relays with `replyTo: socket.id` so the responding
  // peer knows where to send the answer.
  socket.on('whiteboard:sync_request', ({ roomId }: { roomId: string }) => {
    socket.to(roomId).emit('whiteboard:sync_request', { replyTo: socket.id });
  });

  // ── whiteboard:sync_response ───────────────────────────────────────────────
  // A peer has responded with the current scene. Forward it exclusively to
  // the socket that requested the sync (unicast via io.to(replyTo)).
  socket.on(
    'whiteboard:sync_response',
    ({ replyTo, elements, appState }: { replyTo: string; elements: any[]; appState: any }) => {
      io.to(replyTo).emit('whiteboard:sync', { elements, appState });
    },
  );
};
