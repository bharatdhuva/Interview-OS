/**
 * socket/handlers/rtc.handler.ts
 *
 * WebRTC signalling relay for peer-to-peer video/audio connections.
 *
 * Socket.IO is used purely as a signalling channel — the actual media
 * streams travel directly between browsers via WebRTC after negotiation.
 *
 * Signalling flow (standard WebRTC negotiation):
 *   1. Peer A joins and emits `rtc:user-ready` → Peer B knows to initiate.
 *   2. Peer B creates an RTCPeerConnection, generates an SDP offer, and emits
 *      `rtc:offer` addressed to Peer A's socket.id (`to` field).
 *   3. Peer A receives the offer, creates an answer, and emits `rtc:answer`.
 *   4. Both peers exchange `rtc:ice-candidate` messages until a viable
 *      network path (STUN/TURN) is found and the connection is established.
 *
 * Events handled & relayed (point-to-point via socket.id, not room broadcast):
 *   rtc:user-ready      — notify room a peer is ready to begin negotiation
 *   rtc:offer           — SDP offer from the initiating peer
 *   rtc:answer          — SDP answer from the receiving peer
 *   rtc:ice-candidate   — ICE candidate for NAT traversal
 */

import { Server, Socket } from 'socket.io';

export default (io: Server, socket: Socket) => {
  // ── rtc:user-ready ─────────────────────────────────────────────────────────
  // Broadcast to the room so existing peers know to initiate an offer.
  socket.on('rtc:user-ready', ({ roomId, userId }: { roomId: string; userId: string }) => {
    socket.to(roomId).emit('rtc:user-ready', { userId });
  });

  // ── rtc:offer ──────────────────────────────────────────────────────────────
  // Forward SDP offer to the specific target socket (io.to targets a single
  // socket ID, not a room).
  socket.on('rtc:offer', ({ to, offer, from }: { to: string; offer: any; from: string }) => {
    io.to(to).emit('rtc:offer', { offer, from });
  });

  // ── rtc:answer ─────────────────────────────────────────────────────────────
  // Forward SDP answer back to the peer who sent the offer.
  socket.on('rtc:answer', ({ to, answer, from }: { to: string; answer: any; from: string }) => {
    io.to(to).emit('rtc:answer', { answer, from });
  });

  // ── rtc:ice-candidate ──────────────────────────────────────────────────────
  // Relay ICE candidates between peers. Each candidate represents a potential
  // network path; the browser picks the best one automatically (ICE trickle).
  socket.on(
    'rtc:ice-candidate',
    ({ to, candidate, from }: { to: string; candidate: any; from: string }) => {
      io.to(to).emit('rtc:ice-candidate', { candidate, from });
    },
  );
};
