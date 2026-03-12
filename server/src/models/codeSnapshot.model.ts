/**
 * models/codeSnapshot.model.ts
 *
 * Mongoose model for code snapshots taken during an interview session.
 *
 * Snapshots are captured in two ways:
 *  - 'auto'   : triggered by the editor on a configurable interval
 *  - 'manual' : triggered when the user explicitly runs the code (execute endpoint)
 *
 * When a snapshot is created via the execution endpoint, the `executionResult`
 * sub-document is populated with Judge0 output so the interviewer can review
 * both the code and its runtime output in the feedback view.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ICodeSnapshot extends Document {
  room:    mongoose.Types.ObjectId;
  session: mongoose.Types.ObjectId;
  language: string;            // e.g. 'typescript', 'python'
  code:     string;            // full source code at time of snapshot
  triggeredBy: 'auto' | 'manual';
  savedAt: Date;               // indexed for chronological ordering
  executionResult?: {
    stdout?:  string;
    stderr?:  string;  // also contains compile errors for compiled languages
    time?:    string;  // execution time in seconds (Judge0 format)
    memory?:  number;  // memory usage in KB
  };
  createdAt: Date;
  updatedAt: Date;
}

const codeSnapshotSchema = new Schema<ICodeSnapshot>(
  {
    room:    { type: Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'InterviewSession', required: true },
    language: { type: String, required: true },
    code:     { type: String, required: true },
    triggeredBy: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
    savedAt: { type: Date, default: Date.now, index: true },
    executionResult: {
      stdout: { type: String },
      stderr: { type: String },
      time:   { type: String },
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
