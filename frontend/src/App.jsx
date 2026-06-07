import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
const AppRoutes = () => {
    const location = useLocation();
    const [isRouteLoading, setIsRouteLoading] = useState(true);
    const [isApiLoading, setIsApiLoading] = useState(false);
    const isFirstRender = useRef(true);
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
    return (<>
      <SiteLoader visible={isRouteLoading || isApiLoading}/>
            <Routes>
                <Route path="/" element={<LandingPage />}/>
                <Route path="/login" element={<LoginPage />}/>
                <Route path="/register" element={<RegisterPage />}/>
                <Route path="/verify-email" element={<VerifyEmailPage />}/>
                <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
                <Route path="/reset-password/:token" element={<ResetPasswordPage />}/>
                <Route path="/pricing" element={<PricingPage />}/>
                <Route path="/billing/success" element={<BillingSuccessPage />}/>
        <Route path="/dashboard/candidate" element={<CandidateDashboard />}/>
        <Route path="/dashboard/interviewer" element={<InterviewerDashboard />}/>
        <Route path="/room/:roomId" element={<InterviewRoom />}/>
        <Route path="/feedback/:roomId" element={<FeedbackPage />}/>
        <Route path="/onboarding" element={<OnboardingPage />}/>
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
