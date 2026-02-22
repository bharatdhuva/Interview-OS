import mongoose, { Schema, Document } from 'mongoose';
import { IInterviewRoom } from './room.model';
import { IUser } from './user.model';

export interface IChatMessage extends Document {
  room: mongoose.Types.ObjectId | IInterviewRoom;
  sender: mongoose.Types.ObjectId | IUser;
  message: string;
  messageType: 'text' | 'system';
  timestamp: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    room: { type: Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    messageType: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
    timestamp: { type: Date, default: Date.now, index: true },
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
