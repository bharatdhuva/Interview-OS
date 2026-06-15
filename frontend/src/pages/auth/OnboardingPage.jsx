import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

const OnboardingPage = () => {
  const [role, setRole] = useState("candidate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const loginAction = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/onboard", { role });
      const updatedUser = res.data.data;
      
      // Update local auth store with updated user details
      const token = localStorage.getItem("accessToken");
      loginAction(updatedUser, token);

      toast({
        title: "Profile setup completed!",
        description: `Welcome aboard! You are signed in as a ${role}.`,
      });

      // Redirect to correct dashboard or saved redirect URL
      const redirectUrl = sessionStorage.getItem("redirectUrl");
      if (redirectUrl) {
        sessionStorage.removeItem("redirectUrl");
        navigate(redirectUrl);
      } else {
        navigate(role === "interviewer" ? "/dashboard/interviewer" : "/dashboard/candidate");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container min-h-screen w-full flex flex-col justify-center bg-surface relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        :root {
          --outline-variant: #bfcaba;
          --on-secondary-container: #307231;
          --surface-bright: #f8faf8;
          --on-surface-variant: #40493d;
          --on-surface: #191c1b;
          --secondary: #2a6b2c;
          --background: #f8faf8;
          --primary: #0d631b;
        }

        .onboarding-container {
          font-family: 'Montserrat', sans-serif;
          background-color: var(--background);
          color: var(--on-surface);
        }

        .active-role {
          background-color: #acf4a4 !important;
          border-color: #0d631b !important;
          color: #191c1b !important;
        }

        .active-role span {
          color: #191c1b !important;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(191, 202, 186, 0.3);
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      ` }} />

      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#e8f5e9]/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0d631b]/5 rounded-full blur-3xl pointer-events-none"></div>

      <main className="w-full max-w-[520px] mx-auto p-6 relative z-10">
        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          <header className="mb-8 text-center">
            <span className="inline-block px-3 py-1 bg-[#2e7d32] text-white rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              Onboarding
            </span>
            <h1 className="text-3xl font-bold text-on-surface mb-2">
              Let's complete your profile
            </h1>
            <p className="text-sm text-on-surface-variant">
              Welcome {user?.name || "there"}! Choose how you would like to use InterviewOS.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="text-sm font-semibold text-on-surface-variant mb-3 block text-center">
                I will use InterviewOS as an...
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Interviewer Card */}
                <button
                  type="button"
                  onClick={() => setRole("interviewer")}
                  className={`flex flex-col items-center justify-center p-6 border border-outline-variant/30 rounded-2xl transition-all duration-200 hover:border-secondary group text-center cursor-pointer bg-white/50 active:scale-[0.98] ${
                    role === "interviewer" ? "active-role shadow-md" : "text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-[48px] text-[#0d631b] mb-3 group-hover:scale-110 transition-transform">
                    psychology
                  </span>
                  <span className="font-bold text-base mb-1 block">Interviewer</span>
                  <span className="text-xs opacity-75">Create rooms, run sessions, and submit feedback</span>
                </button>

                {/* Candidate Card */}
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`flex flex-col items-center justify-center p-6 border border-outline-variant/30 rounded-2xl transition-all duration-200 hover:border-secondary group text-center cursor-pointer bg-white/50 active:scale-[0.98] ${
                    role === "candidate" ? "active-role shadow-md" : "text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-[48px] text-[#0d631b] mb-3 group-hover:scale-110 transition-transform">
                    terminal
                  </span>
                  <span className="font-bold text-base mb-1 block">Candidate</span>
                  <span className="text-xs opacity-75">Join rooms, write code, and view interview history</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-xs text-red-600 font-semibold text-center" role="alert">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0d631b] hover:bg-[#094713] disabled:opacity-50 text-white rounded-xl font-bold shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving Profile...
                </>
              ) : (
                "Get Started"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;
