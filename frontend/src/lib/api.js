import axios from 'axios';
import { useAuthStore } from '../store/authStore';
let activeRequests = 0;
const activityListeners = new Set();
const notifyActivityListeners = () => {
    activityListeners.forEach((listener) => listener(activeRequests));
};
const beginRequest = () => {
    activeRequests += 1;
    notifyActivityListeners();
};
const endRequest = () => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyActivityListeners();
};
export const subscribeToApiActivity = (listener) => {
    activityListeners.add(listener);
    listener(activeRequests);
    return () => {
        activityListeners.delete(listener);
    };
};
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Request interceptor - token add karo
api.interceptors.request.use((config) => {
    beginRequest();
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    endRequest();
    return Promise.reject(error);
});
// Response interceptor
api.interceptors.response.use((response) => {
    endRequest();
    return response;
}, (error) => {
    endRequest();
    if (error.response?.status === 401) {
        const isAuthRoute = error.config?.url?.includes('/auth/');
        if (!isAuthRoute) {
            useAuthStore.getState().logout();
        }
    }
    return Promise.reject(error);
});
export default api;
