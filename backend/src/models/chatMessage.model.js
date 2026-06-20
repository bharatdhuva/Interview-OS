/**
 * models/chatMessage.model.ts
 *
 * Mongoose model for in-room chat messages.
 *
 * Messages are persisted to MongoDB via the chat Socket.IO handler so that
 * participants who join late can see the conversation history.
 *
 * messageType values:
 *  - 'text'   : a regular user-sent message
 *  - 'system' : a server-generated event notice (e.g. "User X joined")
 */
const mongoose = require("mongoose");
const chatMessageSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    messageType: {
        type: String,
        enum: ['text', 'system'],
        default: 'text',
    },
    timestamp: { type: Date, default: Date.now, index: true }, // indexed for sort / range queries
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
