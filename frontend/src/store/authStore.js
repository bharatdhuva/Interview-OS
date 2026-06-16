import { create } from 'zustand';
// Mock users for demo
const mockInterviewer = {
    id: '1',
    name: 'Alex Chen',
    email: 'alex@interviewos.io',
    role: 'interviewer',
    avatar: '',
    isEmailVerified: true,
    createdAt: '2024-01-15',
};
const mockCandidate = {
    id: '2',
    name: 'Jordan Smith',
    email: 'jordan@gmail.com',
    role: 'candidate',
    avatar: '',
    isEmailVerified: true,
    createdAt: '2024-06-20',
};
export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    login: (user, token) => {
        // Always store the token (even if empty) to keep auth state consistent
        if (token) {
            localStorage.setItem('accessToken', token);
        } else {
            // Ensure any stale token is cleared
            localStorage.removeItem('accessToken');
        }
        set({ user, isAuthenticated: !!token });
    },
    logout: () => {
        localStorage.removeItem('accessToken');
        set({ user: null, isAuthenticated: false });
    },
}));
export { mockInterviewer, mockCandidate };
