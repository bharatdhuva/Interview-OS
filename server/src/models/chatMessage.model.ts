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

import mongoose, { Schema, Document } from 'mongoose';
import { IInterviewRoom } from './room.model';
import { IUser } from './user.model';

export interface IChatMessage extends Document {
  room:        mongoose.Types.ObjectId | IInterviewRoom;
  sender:      mongoose.Types.ObjectId | IUser;
  message:     string;
  messageType: 'text' | 'system';
  timestamp:   Date;   // indexed for efficient chronological queries
  isDeleted:   boolean; // soft-delete flag (message content can be hidden)
  createdAt:   Date;
  updatedAt:   Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    room:    { type: Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    sender:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    messageType: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
    timestamp: { type: Date, default: Date.now, index: true }, // indexed for sort / range queries
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const ChatMessage = mongoose.model<IChatMessage>(
  'ChatMessage',
  chatMessageSchema
);
