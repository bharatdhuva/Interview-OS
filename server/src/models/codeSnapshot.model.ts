import mongoose, { Schema, Document } from 'mongoose';

export interface ICodeSnapshot extends Document {
  room: mongoose.Types.ObjectId;
  session: mongoose.Types.ObjectId;
  language: string;
  code: string;
  triggeredBy: 'auto' | 'manual';
  savedAt: Date;
  executionResult?: {
    stdout?: string;
    stderr?: string;
    time?: string;
    memory?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const codeSnapshotSchema = new Schema<ICodeSnapshot>(
  {
    room: { type: Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    session: {
      type: Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
    },
    language: { type: String, required: true },
    code: { type: String, required: true },
    triggeredBy: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
    savedAt: { type: Date, default: Date.now, index: true },
    executionResult: {
      stdout: { type: String },
      stderr: { type: String },
      time: { type: String },
      memory: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

export const CodeSnapshot = mongoose.model<ICodeSnapshot>(
  'CodeSnapshot',
  codeSnapshotSchema
);
