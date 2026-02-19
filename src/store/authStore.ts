import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

// Mock users for demo
const mockInterviewer: User = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex@interviewos.io',
  role: 'interviewer',
  avatar: '',
  isEmailVerified: true,
  createdAt: '2024-01-15',
};

const mockCandidate: User = {
  id: '2',
  name: 'Jordan Smith',
  email: 'jordan@gmail.com',
  role: 'candidate',
  avatar: '',
  isEmailVerified: true,
  createdAt: '2024-06-20',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

export { mockInterviewer, mockCandidate };
