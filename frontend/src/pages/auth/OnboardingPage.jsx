import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import api from "@/lib/api";
import { Loader2, Users, Code2 } from "lucide-react";
import { motion } from "framer-motion";

const OnboardingPage = () => {
  const [role, setRole] = useState("candidate");
  const [loading, setLoading] = useState(false);
  const [autoMobileOnboarding, setAutoMobileOnboarding] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const loginAction = useAuthStore((s) => s.login);

  useEffect(() => {
    if (!autoMobileOnboarding) return;
    let cancelled = false;
    const completeMobileCandidateOnboarding = async () => {
      try {
        const res = await api.post("/auth/onboard", { role: "candidate" });
        if (cancelled) return;
        const updatedUser = res.data.data;
        const token = localStorage.getItem("accessToken");
        loginAction(updatedUser, token);
        const redirectUrl = sessionStorage.getItem("redirectUrl");
        if (redirectUrl) {
          sessionStorage.removeItem("redirectUrl");
          navigate(redirectUrl, { replace: true });
        } else {
          navigate("/dashboard/candidate", { replace: true });
        }
      } catch (err) {
        if (cancelled) return;
        setAutoMobileOnboarding(false);
        setError(
          err?.response?.data?.message ||
            "Failed to complete setup. Please continue below."
        );
      }
    };
    completeMobileCandidateOnboarding();
    return () => {
      cancelled = true;
    };
  }, [autoMobileOnboarding, loginAction, navigate]);

  if (autoMobileOnboarding) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafbf9] text-[#171917] px-6 text-center"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
        }}
      >
        <Loader2 className="w-6 h-6 animate-spin text-[#008a52] mb-3" />
        <p className="text-[14px] font-medium text-[#171917]">
          Setting up your candidate workspace...
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/onboard", { role });
      const updatedUser = res.data.data;

      const token = localStorage.getItem("accessToken");
      loginAction(updatedUser, token);

      toast({
        title: "Profile setup completed!",
        description: `Welcome aboard! You are signed in as a ${role}.`,
      });

      const redirectUrl = sessionStorage.getItem("redirectUrl");
      if (redirectUrl) {
        sessionStorage.removeItem("redirectUrl");
        navigate(redirectUrl);
      } else {
        navigate(
          role === "interviewer"
            ? "/dashboard/interviewer"
            : "/dashboard/candidate"
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to complete onboarding. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-[#fafbf9] text-[#171917]"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
      }}
    >
      <header className="sticky top-0 z-30 w-full h-[74px] bg-[#fafbf9]/90 backdrop-blur-md border-b border-[#1d2d22]/[0.09] px-6 lg:px-11 flex items-center justify-between select-none shrink-0">
        <Link
          to={
            user?.isOnboarded
              ? user.role === "interviewer"
                ? "/dashboard/interviewer"
                : "/dashboard/candidate"
              : "/"
          }
          className="inline-flex items-center gap-[5px] text-[#111111] text-[21px] font-bold tracking-[-0.01em] leading-none"
          aria-label="InterviewOS home"
        >
          InterviewOS
          <span
            className="inline-block w-[8px] h-[17px] bg-[#00c875]"
            aria-hidden="true"
          />
        </Link>
        <span className="text-[13px] text-[#707870]">Account Setup</span>
      </header>

      <main
        className="flex-1 flex items-center justify-center px-5 py-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(202, 250, 222, 0.55), transparent 55%), linear-gradient(180deg, #f5fbf6 0%, #fafbf9 65%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[540px] bg-white border border-[#e2e7e1] rounded-2xl p-8 sm:p-10 shadow-[0_18px_50px_rgba(20,31,23,0.06)]"
        >
          <header className="mb-8 text-center">
            <p className="text-[11.5px] uppercase tracking-[0.13em] text-[#657168] mb-2">
              Onboarding
            </p>
            <h1
              className="text-[32px] leading-[1.08] font-semibold tracking-[-0.04em] text-[#171917] mb-2"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              }}
            >
              Choose your <span className="text-[#008a52]">role</span>
            </h1>
            <p className="text-[14.5px] text-[#566059]">
              Welcome {user?.name || "there"}! Select how you will use InterviewOS.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("interviewer")}
                className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  role === "interviewer"
                    ? "border-[#008a52] bg-[#f4fbf6] ring-1 ring-[#008a52]"
                    : "border-[#e2e7e1] bg-[#fafbf9] hover:border-[#bfcaba]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    role === "interviewer"
                      ? "bg-[#008a52] text-white"
                      : "bg-[#e8eee9] text-[#414740]"
                  }`}
                >
                  <Users size={20} />
                </div>
                <span className="text-[16px] font-semibold text-[#171917] mb-1">
                  Interviewer
                </span>
                <span className="text-[13px] text-[#566059] leading-relaxed">
                  Create rooms, run live sessions, and review AI evaluation drafts.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  role === "candidate"
                    ? "border-[#008a52] bg-[#f4fbf6] ring-1 ring-[#008a52]"
                    : "border-[#e2e7e1] bg-[#fafbf9] hover:border-[#bfcaba]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    role === "candidate"
                      ? "bg-[#008a52] text-white"
                      : "bg-[#e8eee9] text-[#414740]"
                  }`}
                >
                  <Code2 size={20} />
                </div>
                <span className="text-[16px] font-semibold text-[#171917] mb-1">
                  Candidate
                </span>
                <span className="text-[13px] text-[#566059] leading-relaxed">
                  Join interview rooms, write and run code, and view shared feedback.
                </span>
              </button>
            </div>

            {error && (
              <div
                className="p-3 rounded-xl bg-[#ffdad6]/40 border border-[#ba1a1a]/25 text-xs text-[#ba1a1a] font-medium text-center"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] rounded-full bg-[#080a09] hover:bg-[#242925] disabled:opacity-50 text-white text-[14px] font-semibold transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  Continue <span aria-hidden="true">↗</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default OnboardingPage;
