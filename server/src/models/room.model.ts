import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';
import { IUser } from './user.model';

export interface IInterviewRoom extends Document {
  roomId: string;
  title: string;
  description?: string;
  interviewer: mongoose.Types.ObjectId | IUser;
  candidate?: mongoose.Types.ObjectId | IUser;
  scheduledAt: Date;
  durationMinutes: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  inviteToken?: string;
  inviteExpiresAt?: Date;
  problemStatement?: string;
  techStack?: string[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

const interviewRoomSchema = new Schema<IInterviewRoom>(
  {
    roomId: { type: String, unique: true, index: true, default: () => crypto.randomUUID() },
    title: { type: String, required: true },
    description: { type: String },
    interviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User' },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    inviteToken: { type: String },
    inviteExpiresAt: { type: Date },
    problemStatement: { type: String },
    techStack: [{ type: String }],
    difficultyLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

export const InterviewRoom = mongoose.model<IInterviewRoom>(
  'InterviewRoom',
  interviewRoomSchema
);
