import mongoose, { Schema, Document } from 'mongoose';
import { IInterviewRoom } from './room.model';

export interface IInterviewSession extends Document {
  room: mongoose.Types.ObjectId | IInterviewRoom;
  startTime: Date;
  endTime?: Date;
  durationSeconds?: number;
  finalCode?: string;
  finalLanguage?: string;
  codeSnapshots: mongoose.Types.ObjectId[];
  whiteboardSnapshot?: any; // JSON representation of Excalidraw elements
  recordingUrl?: string;
  connectionLog: Array<{
    userId: mongoose.Types.ObjectId;
    event: 'joined' | 'left' | 'disconnected' | 'reconnected';
    timestamp: Date;
  }>;
  violationLog: Array<{
    type: 'fullscreen_exit' | 'tab_switch' | 'window_blur' | 'paste_attempt' | 'suspicious_paste' | 'no_face_detected' | 'multiple_faces';
    timestamp: Date;
    count: number;
  }>;
  proctoringResult?: 'clean' | 'warned' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
}

const interviewSessionSchema = new Schema<IInterviewSession>(
  {
    room: { type: Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    durationSeconds: { type: Number },
    finalCode: { type: String },
    finalLanguage: { type: String },
    codeSnapshots: [{ type: Schema.Types.ObjectId, ref: 'CodeSnapshot' }],
    whiteboardSnapshot: { type: Schema.Types.Mixed },
    recordingUrl: { type: String },
    connectionLog: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        event: {
          type: String,
          enum: ['joined', 'left', 'disconnected', 'reconnected'],
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    violationLog: [
      {
        type: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        count: { type: Number, default: 1 },
      },
    ],
    proctoringResult: {
      type: String,
      enum: ['clean', 'warned', 'terminated'],
      default: 'clean',
    },
  },
  {
    timestamps: true,
  }
);

export const InterviewSession = mongoose.model<IInterviewSession>(
  'InterviewSession',
  interviewSessionSchema
);
