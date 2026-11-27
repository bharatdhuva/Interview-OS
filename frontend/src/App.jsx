import { Toaster } from "@/components/ui/Toaster";
import { Toaster as Sonner } from "@/components/ui/Sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "./store/authStore";
import api from "./lib/api";
import LandingPage from "./pages/LandingPage";
import SiteLoader from "./components/layout/SiteLoader";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const CandidateDashboard = lazy(() => import("./pages/dashboard/CandidateDashboard"));
const InterviewerDashboard = lazy(() => import("./pages/dashboard/InterviewerDashboard"));
const InterviewRoom = lazy(() => import("./pages/room/InterviewRoom"));
const FeedbackPage = lazy(() => import("./pages/feedback/FeedbackPage"));
const SessionReplayPage = lazy(() => import("./pages/room/SessionReplayPage"));
const AiInterviewRoom = lazy(() => import("./pages/ai/AiInterviewRoom"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OnboardingPage = lazy(() => import("./pages/auth/OnboardingPage"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
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
    const user = useAuthStore((s) => s.user);
    const [isRestoringUser, setIsRestoringUser] = useState(
        () => Boolean(localStorage.getItem("accessToken") && !useAuthStore.getState().user)
    );

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
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [location.pathname, location.search]);

    const protectedFallback = isRestoringUser && localStorage.getItem("accessToken");

    return (
      <Suspense fallback={<SiteLoader visible={true} />}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
            <Routes location={location}>
                <Route path="/" element={<LandingPage />}/>
                <Route path="/login" element={<LoginPage />}/>
                <Route path="/register" element={<RegisterPage />}/>
                <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
                <Route path="/terms" element={<InfoPage page="terms" />}/>
                <Route path="/privacy" element={<InfoPage page="privacy" />}/>
                <Route path="/about" element={<InfoPage page="about" />}/>
                <Route path="/careers" element={<InfoPage page="careers" />}/>
                <Route path="/contact" element={<InfoPage page="contact" />}/>
                <Route path="/support" element={<InfoPage page="support" />}/>
                <Route path="/changelog" element={<InfoPage page="changelog" />}/>

        <Route path="/dashboard/candidate" element={protectedFallback ? <SiteLoader visible={true} /> : <ProtectedRoute><CandidateDashboard /></ProtectedRoute>}/>
        <Route path="/dashboard/interviewer" element={protectedFallback ? <SiteLoader visible={true} /> : <ProtectedRoute><InterviewerDashboard /></ProtectedRoute>}/>
        <Route path="/room/:roomId" element={protectedFallback ? <SiteLoader visible={true} /> : <ProtectedRoute><InterviewRoom /></ProtectedRoute>}/>
        <Route path="/room/:roomId/replay" element={protectedFallback ? <SiteLoader visible={true} /> : <ProtectedRoute><SessionReplayPage /></ProtectedRoute>}/>
        <Route path="/feedback/:roomId" element={protectedFallback ? <SiteLoader visible={true} /> : <ProtectedRoute><FeedbackPage /></ProtectedRoute>}/>
        <Route path="/ai-interview/:sessionId" element={protectedFallback ? <SiteLoader visible={true} /> : <ProtectedRoute><AiInterviewRoom /></ProtectedRoute>}/>
        <Route path="/onboarding" element={protectedFallback ? <SiteLoader visible={true} /> : <ProtectedRoute><OnboardingPage /></ProtectedRoute>}/>
        <Route path="*" element={<NotFound />}/>
      </Routes>
        </motion.div>
      </AnimatePresence>
      </Suspense>
    );
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
