import mongoose, { Document } from 'mongoose';
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
export declare const CodeSnapshot: mongoose.Model<ICodeSnapshot, {}, {}, {}, mongoose.Document<unknown, {}, ICodeSnapshot, {}, mongoose.DefaultSchemaOptions> & ICodeSnapshot & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICodeSnapshot>;
//# sourceMappingURL=codeSnapshot.model.d.ts.map