import { Types } from 'mongoose';
export declare const generateAccessToken: (userId: string | Types.ObjectId, role: string) => never;
export declare const generateRefreshToken: (userId: string | Types.ObjectId) => never;
export declare const generateInviteToken: (roomId: string | Types.ObjectId) => string;
//# sourceMappingURL=jwt.d.ts.map