"use strict";
/**
 * socket/handlers/chat.handler.ts
 *
 * Handles real-time chat events for an interview room.
 *
 * Events handled (CLIENT → SERVER):
 *   chat:message  — send a new text message to all room participants
 *   chat:typing   — broadcast typing indicator to other room participants
 *
 * Events emitted (SERVER → ROOM):
 *   chat:message  — the persisted ChatMessage document (includes _id, timestamps)
 *   chat:typing   — { userId, isTyping } indicator forwarded to peers
 *
 * Persistence:
 *   Every chat:message is written to MongoDB (ChatMessage model) before being
 *   broadcast so the conversation history can be fetched on reconnect.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chatMessage_model_1 = require("../../models/chatMessage.model");
const logger_1 = __importDefault(require("../../utils/logger"));
exports.default = (io, socket) => {
    // ── chat:message ───────────────────────────────────────────────────────────
    // Persist the message to MongoDB, then broadcast the saved document
    // (including its generated _id and createdAt) to the whole room.
    socket.on('chat:message', async ({ roomId, senderId, message }) => {
        // Validate required fields before touching the database
        if (!roomId || !senderId || !message?.trim()) {
            return;
        }
        try {
            const chatMsg = await chatMessage_model_1.ChatMessage.create({
                room: roomId,
                sender: senderId,
                message: message.trim(),
                messageType: 'text',
            });
            // Emit to ALL sockets in the room (including the sender) so the
            // sender also receives the server-assigned _id and timestamp.
            io.to(roomId).emit('chat:message', chatMsg);
        }
        catch (error) {
            logger_1.default.error('Error saving chat message', error);
        }
    });
    // ── chat:typing ────────────────────────────────────────────────────────────
    // Relay typing indicator to peers only (exclude the sender).
    // isTyping: true  → user started typing
    // isTyping: false → user stopped typing (debounced on client side)
    socket.on('chat:typing', ({ roomId, userId, isTyping }) => {
        if (!roomId || !userId)
            return;
        socket.to(roomId).emit('chat:typing', { userId, isTyping });
    });
};
