/**
 * models/feedback.model.ts
 *
 * Mongoose model for post-interview feedback.
 *
 * Submitted by the interviewer after the session ends.  The feedback is
 * private until the interviewer explicitly calls the /share endpoint, at
 * which point `isSharedWithCandidate` is flipped to true and the candidate
 * can read it via GET /api/v1/feedback/:roomId.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  room:        mongoose.Types.ObjectId;
  session:     mongoose.Types.ObjectId;
  interviewer: mongoose.Types.ObjectId;
  candidate:   mongoose.Types.ObjectId;

  // Numeric ratings (1–5 scale) across four competencies
  ratings: {
    problemSolving: number;
    codeQuality:    number;
    communication:  number;
    efficiency:     number;
  };

  strengths?:    string;  // free-text: what the candidate did well
  improvements?: string;  // free-text: areas to work on
  overallNotes?: string;  // any extra context for the hiring team

  recommendation: 'strong_yes' | 'yes' | 'no' | 'strong_no';

  // Snapshot of proctoring violations from the session for HR review
  proctoringViolations?: any;

  // Gates candidate read access until interviewer explicitly shares
  isSharedWithCandidate: boolean;

  submittedAt: Date;
  createdAt:   Date;
  updatedAt:   Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    room:        { type: Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    session:     { type: Schema.Types.ObjectId, ref: 'InterviewSession', required: true },
    interviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    candidate:   { type: Schema.Types.ObjectId, ref: 'User', required: true },

    ratings: {
      problemSolving: { type: Number, min: 1, max: 5, required: true },
      codeQuality:    { type: Number, min: 1, max: 5, required: true },
      communication:  { type: Number, min: 1, max: 5, required: true },
      efficiency:     { type: Number, min: 1, max: 5, required: true },
    },

    strengths:    { type: String },
    improvements: { type: String },
    overallNotes: { type: String },

    recommendation: {
      type: String,
      enum: ['strong_yes', 'yes', 'no', 'strong_no'],
      required: true,
    },

    // Copied from session.violationLog at submission time for an immutable record
    proctoringViolations: { type: Schema.Types.Mixed },

    // Set to true when interviewer explicitly shares via PATCH /share
    isSharedWithCandidate: { type: Boolean, default: false },

    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
