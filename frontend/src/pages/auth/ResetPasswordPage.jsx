import React, { useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle, AlertCircle, ArrowLeft, Zap } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import AuthNavbar from "@/components/AuthNavbar";


const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/* Password strength calculation */
const getPasswordStrength = (pw) => {
  if (!pw) return { level: 0, label: "", color: "" };
  
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  
  const map = {
    1: { label: "Weak", color: "#ba1a1a" },
    2: { label: "Fair", color: "#fbbf24" },
    3: { label: "Good", color: "#88d982" },
    4: { label: "Strong", color: "#0d631b" },
  };
  
  const clamped = Math.max(1, Math.min(4, score));
  return { level: clamped, ...map[clamped] };
};

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [serverError, setServerError] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { register, handleSubmit, watch, formState: { errors, touchedFields } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      token: token || "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");
  const emailValue = watch("email");
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: data.email,
        token: data.token,
        newPassword: data.newPassword,
      });
      setReset(true);
      toast({
        title: "Password reset! 🎉",
        description: "Your password has been successfully changed. Redirecting to login...",
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to reset password. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container h-screen w-full flex flex-col relative overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        :root {
          --outline-variant: #bfcaba;
          --on-secondary-container: #307231;
          --surface-bright: #f8faf8;
          --on-surface-variant: #40493d;
          --on-surface: #191c1b;
          --background: #f8faf8;
          --primary: #0d631b;
          --error: #ba1a1a;
          --on-primary: #ffffff;
        }

        .reset-container {
          font-family: 'Montserrat', sans-serif;
          background-color: var(--background);
          color: var(--on-surface);
        }

        .bg-primary { background-color: #0d631b !important; }
        .text-primary { color: #0d631b !important; }

        .glass-effect {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        `
      }} />

      <AuthNavbar pageType="reset" />

      <main className="flex flex-1 flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Section: Brand & Visuals (Desktop) */}
        <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-8 h-full">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(163, 246, 156, 0.15) 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
          </div>

          <div className="relative z-10 w-full max-w-lg text-white">
            <div className="mb-12">
              <span className="inline-block px-3 py-1 bg-[#2e7d32] text-white rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
                Security Core
              </span>
              <h1 className="text-5xl font-bold mb-4 tracking-tight leading-tight">InterviewOS</h1>
              <p className="text-lg opacity-95 max-w-md text-emerald-100">
                Create a strong and unique password to safeguard your interview data and analytics.
              </p>
            </div>

            {/* Code Snippet Card */}
            <div className="glass-effect rounded-2xl p-6 border border-emerald-800/20 shadow-2xl overflow-hidden text-[#40493d]">
              <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/10 pb-3">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-2 font-mono text-[12px] opacity-60">reset_agent.sh</span>
              </div>
              <pre className="font-mono text-sm leading-relaxed text-[#40493d]">
                <span className="text-[#0d631b] font-bold">curl</span> -X POST \{"\n"}
                {"  "}https://api.interviewos.io/auth/reset-password/confirm \{"\n"}
                {"  "}-H <span className="text-[#2a6b2c]">'Content-Type: application/json'</span> \{"\n"}
                {"  "}-d <span className="text-[#2a6b2c]">'&#123; "email": "{emailValue || "email@domain.com"}" &#125;'</span>{"\n\n"}
                <span className="opacity-40"># Password constraints verified</span>
              </pre>
            </div>
          </div>
        </section>

        {/* Right Section: Reset Password Form */}
        <section className="w-full lg:w-1/2 flex flex-col items-center bg-[#f8faf8] p-8 min-h-0 relative justify-center py-8 overflow-y-auto h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#e8f5e9]/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0d631b]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-full max-w-[440px] relative z-10">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1 tracking-tight">Create new password 🔐</h2>
                <p className="text-sm text-muted-foreground">
                  Make it strong and keep it secure.
                </p>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5" htmlFor="reset-email">
                    Confirm Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-white transition-all outline-none text-sm text-foreground"
                  />
                  {errors.email && touchedFields.email && (
                    <p className="text-xs text-red-600 font-semibold mt-1" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5" htmlFor="reset-password">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      id="reset-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("newPassword")}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-white transition-all outline-none text-sm text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-muted-foreground">Strength:</span>
                        <span className="text-[11px] font-semibold" style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary/15 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(strength.level / 4) * 100}%`, backgroundColor: strength.color }}></div>
                      </div>
                    </div>
                  )}
                  {errors.newPassword && touchedFields.newPassword && (
                    <p className="text-xs text-red-600 font-semibold mt-1" role="alert">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5" htmlFor="reset-confirm">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      id="reset-confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-white transition-all outline-none text-sm text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && touchedFields.confirmPassword && (
                    <p className="text-xs text-red-600 font-semibold mt-1" role="alert">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Password Tips */}
                <div className="p-3 bg-secondary/10 border border-primary/15 rounded-xl flex gap-3">
                  <Zap size={16} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12px] font-semibold mb-1 text-primary">Password requirements:</p>
                    <ul className="text-[11px] space-y-0.5 text-muted-foreground">
                      <li>✓ At least 8 characters</li>
                      <li>✓ Uppercase & lowercase letters</li>
                      <li>✓ At least one number</li>
                    </ul>
                  </div>
                </div>

                {serverError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                    <AlertCircle size={16} className="shrink-0" />
                    <p>{serverError}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || reset}
                className="w-full py-3 bg-[#0d631b] hover:bg-[#094713] disabled:opacity-50 text-white rounded-xl font-semibold transition-all active:scale-95 duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Resetting...
                  </>
                ) : reset ? (
                  <>
                    <CheckCircle size={16} /> Password reset!
                  </>
                ) : (
                  <>
                    Reset Password <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-outline-variant/20">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                  <ArrowLeft size={16} /> Back to login
                </Link>
              </div>
            </form>
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 opacity-40">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs text-muted-foreground">InterviewOS Core v4.2 Online</span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
