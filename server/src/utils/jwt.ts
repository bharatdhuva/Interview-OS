import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'interviewos_access_secret_bharat_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'interviewos_refresh_secret_bharat_2026';
export const generateAccessToken = (userId: string | Types.ObjectId, role: string) => {
  return jwt.sign({ id: userId, role }, ACCESS_SECRET, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m') as any,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string | Types.ObjectId) => {
  return jwt.sign({ id: userId }, REFRESH_SECRET, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d') as any,
  } as jwt.SignOptions);
};

export const generateInviteToken = (roomId: string | Types.ObjectId) => {
  return jwt.sign({ roomId }, process.env.INVITE_TOKEN_SECRET as string, {
    expiresIn: '24h',
  } as jwt.SignOptions);
};
