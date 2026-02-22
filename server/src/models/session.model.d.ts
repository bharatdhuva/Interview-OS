import mongoose, { Document } from 'mongoose';
import { IInterviewRoom } from './room.model';
export interface IInterviewSession extends Document {
    room: mongoose.Types.ObjectId | IInterviewRoom;
    startTime: Date;
    endTime?: Date;
    durationSeconds?: number;
    finalCode?: string;
    finalLanguage?: string;
    codeSnapshots: mongoose.Types.ObjectId[];
    whiteboardSnapshot?: any;
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
export declare const InterviewSession: mongoose.Model<IInterviewSession, {}, {}, {}, mongoose.Document<unknown, {}, IInterviewSession, {}, mongoose.DefaultSchemaOptions> & IInterviewSession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInterviewSession>;
//# sourceMappingURL=session.model.d.ts.map