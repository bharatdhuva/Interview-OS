import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  room: mongoose.Types.ObjectId;
  session: mongoose.Types.ObjectId;
  interviewer: mongoose.Types.ObjectId;
  candidate: mongoose.Types.ObjectId;
  ratings: {
    problemSolving: number;
    codeQuality: number;
    communication: number;
    efficiency: number;
  };
  strengths?: string;
  improvements?: string;
  overallNotes?: string;
  recommendation: 'strong_yes' | 'yes' | 'no' | 'strong_no';
  proctoringViolations?: any; // mixed or reference to session violation log
  isSharedWithCandidate: boolean;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    room: { type: Schema.Types.ObjectId, ref: 'InterviewRoom', required: true },
    session: {
      type: Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
    },
    interviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: {
      problemSolving: { type: Number, min: 1, max: 5, required: true },
      codeQuality: { type: Number, min: 1, max: 5, required: true },
      communication: { type: Number, min: 1, max: 5, required: true },
      efficiency: { type: Number, min: 1, max: 5, required: true },
    },
    strengths: { type: String },
    improvements: { type: String },
    overallNotes: { type: String },
    recommendation: {
      type: String,
      enum: ['strong_yes', 'yes', 'no', 'strong_no'],
      required: true,
    },
    proctoringViolations: { type: Schema.Types.Mixed },
    isSharedWithCandidate: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
