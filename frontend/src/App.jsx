import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import api from "./lib/api";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import PricingPage from "./pages/PricingPage";
import BillingSuccessPage from "./pages/BillingSuccessPage";
import CandidateDashboard from "./pages/dashboard/CandidateDashboard";
import InterviewerDashboard from "./pages/dashboard/InterviewerDashboard";
import InterviewRoom from "./pages/room/InterviewRoom";
import FeedbackPage from "./pages/feedback/FeedbackPage";
import NotFound from "./pages/NotFound";
import OnboardingPage from "./pages/auth/OnboardingPage";
import SiteLoader from "./components/SiteLoader";
import { subscribeToApiActivity } from "./lib/api";
const queryClient = new QueryClient();
const ProtectedRoute = ({ children }) => {
    const user = useAuthStore((s) => s.user);
    const token = localStorage.getItem("accessToken");
    const location = useLocation();
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    if (!user) {
        return <SiteLoader visible={true} />;
    }
    return children;
};

const AppRoutes = () => {
    const location = useLocation();
    const [isRouteLoading, setIsRouteLoading] = useState(true);
    const [isApiLoading, setIsApiLoading] = useState(false);
    const isFirstRender = useRef(true);
    
    const user = useAuthStore((s) => s.user);
    const [isRestoringUser, setIsRestoringUser] = useState(true);

    useEffect(() => {
        const restoreUser = async () => {
            const token = localStorage.getItem("accessToken");
            if (token && !user) {
                try {
                    const res = await api.get("/auth/me");
                    useAuthStore.setState({ user: res.data.data, isAuthenticated: true });
                } catch (err) {
                    console.error("Session restoration failed:", err);
                    useAuthStore.getState().logout();
                }
            }
            setIsRestoringUser(false);
        };
        restoreUser();
    }, [user]);

    useEffect(() => {
        const timer = window.setTimeout(() => setIsRouteLoading(false), 650);
        return () => window.clearTimeout(timer);
    }, []);
    useEffect(() => {
        let hideTimer;
        const unsubscribe = subscribeToApiActivity((count) => {
            if (count > 0) {
                if (hideTimer) {
                    window.clearTimeout(hideTimer);
                }
                setIsApiLoading(true);
                return;
            }
            hideTimer = window.setTimeout(() => setIsApiLoading(false), 150);
        });
        return () => {
            if (hideTimer) {
                window.clearTimeout(hideTimer);
            }
            unsubscribe();
        };
    }, []);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setIsRouteLoading(true);
        const timer = window.setTimeout(() => setIsRouteLoading(false), 280);
        return () => window.clearTimeout(timer);
    }, [location.pathname, location.search]);

    if (isRestoringUser && localStorage.getItem("accessToken")) {
        return <SiteLoader visible={true} />;
    }

    return (<>
      <SiteLoader visible={isRouteLoading}/>
            <Routes>
                <Route path="/" element={<LandingPage />}/>
                <Route path="/login" element={<LoginPage />}/>
                <Route path="/register" element={<RegisterPage />}/>
                <Route path="/verify-email" element={<VerifyEmailPage />}/>
                <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
                <Route path="/reset-password/:token" element={<ResetPasswordPage />}/>
                <Route path="/pricing" element={<PricingPage />}/>
                <Route path="/billing/success" element={<ProtectedRoute><BillingSuccessPage /></ProtectedRoute>}/>
        <Route path="/dashboard/candidate" element={<ProtectedRoute><CandidateDashboard /></ProtectedRoute>}/>
        <Route path="/dashboard/interviewer" element={<ProtectedRoute><InterviewerDashboard /></ProtectedRoute>}/>
        <Route path="/room/:roomId" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>}/>
        <Route path="/feedback/:roomId" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>}/>
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>}/>
        <Route path="*" element={<NotFound />}/>
      </Routes>
    </>);
};
const App = () => (<QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>);
export default App;
