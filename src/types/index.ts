export type UserRole = 'candidate' | 'interviewer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export type RoomStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type Recommendation = 'strong_yes' | 'yes' | 'no' | 'strong_no';

export interface InterviewRoom {
  id: string;
  roomId: string;
  title: string;
  description?: string;
  interviewer: User;
  candidate?: User;
  candidateEmail?: string;
  scheduledAt: string;
  durationMinutes: number;
  status: RoomStatus;
  problemStatement?: string;
  techStack: string[];
  difficultyLevel: DifficultyLevel;
  createdAt: string;
}

export interface Feedback {
  id: string;
  roomId: string;
  interviewer: User;
  candidate: User;
  ratings: {
    problemSolving: number;
    codeQuality: number;
    communication: number;
    efficiency: number;
  };
  strengths: string;
  improvements: string;
  overallNotes: string;
  recommendation: Recommendation;
  isSharedWithCandidate: boolean;
  submittedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface CodeSnapshot {
  id: string;
  language: string;
  code: string;
  triggeredBy: 'auto' | 'manual';
  savedAt: string;
}
