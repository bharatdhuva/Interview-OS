import mongoose, { Document } from 'mongoose';
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
    proctoringViolations?: any;
    isSharedWithCandidate: boolean;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Feedback: mongoose.Model<IFeedback, {}, {}, {}, mongoose.Document<unknown, {}, IFeedback, {}, mongoose.DefaultSchemaOptions> & IFeedback & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IFeedback>;
//# sourceMappingURL=feedback.model.d.ts.map