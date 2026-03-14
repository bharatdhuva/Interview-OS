import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CandidateDashboard from "./pages/dashboard/CandidateDashboard";
import InterviewerDashboard from "./pages/dashboard/InterviewerDashboard";
import InterviewRoom from "./pages/room/InterviewRoom";
import FeedbackPage from "./pages/feedback/FeedbackPage";
import NotFound from "./pages/NotFound";
import SiteLoader from "./components/SiteLoader";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 280);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search]);

  return (
    <>
      <SiteLoader visible={isLoading} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard/candidate" element={<CandidateDashboard />} />
        <Route path="/dashboard/interviewer" element={<InterviewerDashboard />} />
        <Route path="/room/:roomId" element={<InterviewRoom />} />
        <Route path="/feedback/:roomId" element={<FeedbackPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
