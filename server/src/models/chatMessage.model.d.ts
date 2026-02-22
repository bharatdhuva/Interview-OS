import mongoose, { Document } from 'mongoose';
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
export declare const ChatMessage: mongoose.Model<IChatMessage, {}, {}, {}, mongoose.Document<unknown, {}, IChatMessage, {}, mongoose.DefaultSchemaOptions> & IChatMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IChatMessage>;
//# sourceMappingURL=chatMessage.model.d.ts.map