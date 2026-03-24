"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const roomPeers = new Map();
const getPeersInRoom = (roomId) => {
    const peers = roomPeers.get(roomId);
    if (!peers) {
        return [];
    }
    return Array.from(peers.values());
};
const addPeerToRoom = ({ roomId, userId, role }, socketId) => {
    const peers = roomPeers.get(roomId) ?? new Map();
    roomPeers.set(roomId, peers);
    const existingPeers = Array.from(peers.values()).filter((peer) => peer.socketId !== socketId);
    peers.set(socketId, { socketId, userId, role });
    return existingPeers;
};
const removePeerFromRoom = (roomId, socketId) => {
    const peers = roomPeers.get(roomId);
    if (!peers) {
        return null;
    }
    const removedPeer = peers.get(socketId);
    if (!removedPeer) {
        return null;
    }
    peers.delete(socketId);
    if (peers.size === 0) {
        roomPeers.delete(roomId);
    }
    return removedPeer;
};
const emitRtcError = (socket, message) => {
    socket.emit('rtc:error', { message });
};
const relayToPeer = (io, socket, eventName, payload) => {
    if (!payload?.to || !payload?.data) {
        emitRtcError(socket, `${eventName} requires 'to' and 'data'.`);
        return;
    }
    const sender = payload.from ?? socket.id;
    io.to(payload.to).emit(eventName, {
        roomId: payload.roomId,
        from: sender,
        userId: payload.userId,
        data: payload.data,
    });
};
exports.default = (io, socket) => {
    socket.on('rtc:join', ({ roomId, userId, role }) => {
        if (!roomId || !userId) {
            emitRtcError(socket, `rtc:join requires 'roomId' and 'userId'.`);
            return;
        }
        socket.join(roomId);
        const existingPeers = addPeerToRoom({ roomId, userId, role }, socket.id);
        socket.emit('rtc:peers', {
            roomId,
            peers: existingPeers,
        });
        socket.to(roomId).emit('rtc:peer-joined', {
            roomId,
            peer: {
                socketId: socket.id,
                userId,
                role,
            },
        });
    });
    socket.on('rtc:leave', ({ roomId }) => {
        if (!roomId) {
            emitRtcError(socket, `rtc:leave requires 'roomId'.`);
            return;
        }
        socket.leave(roomId);
        const removedPeer = removePeerFromRoom(roomId, socket.id);
        if (!removedPeer) {
            return;
        }
        socket.to(roomId).emit('rtc:peer-left', {
            roomId,
            peer: removedPeer,
        });
    });
    // Legacy compatibility event used by existing clients.
    socket.on('rtc:user-ready', ({ roomId, userId }) => {
        if (!roomId || !userId) {
            emitRtcError(socket, `rtc:user-ready requires 'roomId' and 'userId'.`);
            return;
        }
        socket.to(roomId).emit('rtc:user-ready', { roomId, userId, socketId: socket.id });
    });
    socket.on('rtc:offer', ({ roomId, to, offer, from, userId }) => {
        relayToPeer(io, socket, 'rtc:offer', { roomId, to, from, userId, data: offer });
    });
    socket.on('rtc:answer', ({ roomId, to, answer, from, userId }) => {
        relayToPeer(io, socket, 'rtc:answer', { roomId, to, from, userId, data: answer });
    });
    socket.on('rtc:ice-candidate', ({ roomId, to, candidate, from, userId }) => {
        relayToPeer(io, socket, 'rtc:ice-candidate', { roomId, to, from, userId, data: candidate });
    });
    socket.on('disconnecting', () => {
        const joinedRooms = Array.from(socket.rooms).filter((roomId) => roomId !== socket.id);
        joinedRooms.forEach((roomId) => {
            const removedPeer = removePeerFromRoom(roomId, socket.id);
            if (!removedPeer) {
                return;
            }
            socket.to(roomId).emit('rtc:peer-left', {
                roomId,
                peer: removedPeer,
            });
        });
    });
    socket.on('rtc:peers:get', ({ roomId }) => {
        if (!roomId) {
            emitRtcError(socket, `rtc:peers:get requires 'roomId'.`);
            return;
        }
        const peers = getPeersInRoom(roomId).filter((peer) => peer.socketId !== socket.id);
        socket.emit('rtc:peers', { roomId, peers });
    });
};
