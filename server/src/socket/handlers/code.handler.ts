/**
 * socket/handlers/code.handler.ts
 *
 * Relays collaborative code-editor events between room participants.
 * All events are forwarded to peers only (socket.to, not io.to), so the
 * originating client handles its own optimistic updates.
 *
 * Events handled (CLIENT → SERVER):
 *   code:change    — Operational-Transform / CRDT delta from the active editor
 *   code:cursor    — Remote cursor position + user identity for awareness UI
 *   code:language  — Language switch (e.g. javascript → python)
 *
 * Events emitted (SERVER → ROOM, sender excluded):
 *   code:change    — { delta, language, userId } — apply delta on remote editors
 *   code:cursor    — { userId, position, name, color } — render remote cursors
 *   code:language  — { language } — switch all editors to the new language
 */

import { Server, Socket } from 'socket.io';

export default (io: Server, socket: Socket) => {
  // ── code:change ────────────────────────────────────────────────────────────
  // `delta` is an editor-specific diff object (e.g. CodeMirror ChangeSet or
  // Monaco IModelContentChangedEvent). The sender’s socket.id is attached so
  // peers can ignore their own reflected events if needed.
  socket.on(
    'code:change',
    ({ roomId, delta, language }: { roomId: string; delta: any; language: string }) => {
      socket.to(roomId).emit('code:change', { delta, language, userId: socket.id });
    },
  );

  // ── code:cursor ────────────────────────────────────────────────────────────
  // `position` contains line/column data. `name` and `color` are used to
  // render a labelled cursor badge in the editor overlay.
  socket.on(
    'code:cursor',
    ({
      roomId,
      userId,
      position,
      name,
      color,
    }: {
      roomId: string;
      userId: string;
      position: any;
      name: string;
      color: string;
    }) => {
      socket.to(roomId).emit('code:cursor', { userId, position, name, color });
    },
  );

  // ── code:language ──────────────────────────────────────────────────────────
  // Synchronises the selected language across all participants so everyone
  // sees the same syntax highlighting and the execution handler uses the
  // correct Judge0 language ID.
  socket.on(
    'code:language',
    ({ roomId, language }: { roomId: string; language: string }) => {
      socket.to(roomId).emit('code:language', { language });
    },
  );
};
