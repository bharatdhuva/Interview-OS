import mongoose, { Document } from 'mongoose';
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
export declare const InterviewRoom: mongoose.Model<IInterviewRoom, {}, {}, {}, mongoose.Document<unknown, {}, IInterviewRoom, {}, mongoose.DefaultSchemaOptions> & IInterviewRoom & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInterviewRoom>;
//# sourceMappingURL=room.model.d.ts.map