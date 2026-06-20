import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle, ArrowLeft, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import AuthNavbar from "@/components/layout/AuthNavbar";

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

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isOtpValid = otp.length === 6;
  const isPasswordValid = newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /\d/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!isEmailValid) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setServerError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast({
        title: "OTP Sent! 📧",
        description: "We've sent a 6-digit password reset code to your email.",
      });
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to send OTP. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP Length
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!isOtpValid) {
      setError("OTP must be exactly 6 digits");
      return;
    }
    setError("");
    setStep(3);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError("Password does not meet the requirements");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setServerError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        token: otp,
        newPassword,
      });
      toast({
        title: "Password reset! 🎉",
        description: "Your password has been successfully changed.",
      });
      setStep(4);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to reset password. Please verify your OTP code.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container h-screen w-full flex flex-col relative overflow-hidden">
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

        .forgot-container {
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

      <AuthNavbar pageType="forgot" />

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
                Recover your access details securely and get back to interviewing candidate talent.
              </p>
            </div>

            {/* Dynamic Code Snippet Card */}
            <div className="glass-effect rounded-2xl p-6 border border-emerald-800/20 shadow-2xl overflow-hidden text-[#40493d]">
              <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/10 pb-3">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-2 font-mono text-[12px] opacity-60">
                  {step === 1 && "request_otp.sh"}
                  {step === 2 && "verify_otp.sh"}
                  {step === 3 && "reset_password.sh"}
                  {step === 4 && "success_session.sh"}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.pre
                  key={step}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="font-mono text-sm leading-relaxed text-[#40493d]"
                >
                  {step === 1 && (
                    <>
                      <span className="text-[#0d631b] font-bold">curl</span> -X POST \{"\n"}
                      {"  "}https://api.interviewos.io/auth/forgot-password \{"\n"}
                      {"  "}-H <span className="text-[#2a6b2c]">'Content-Type: application/json'</span> \{"\n"}
                      {"  "}-d <span className="text-[#2a6b2c]">'&#123; "email": "{email || "you@example.com"}" &#125;'</span>{"\n\n"}
                      <span className="opacity-40"># Requests 6-digit OTP code via email</span>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <span className="opacity-40"># Enter the OTP sent to your email</span>{"\n"}
                      <span className="text-[#0d631b] font-bold">set</span> otp_code = <span className="text-[#2a6b2c]">"{otp || "••••••"}"</span>{"\n"}
                      <span className="text-[#0d631b] font-bold">assert</span> len(otp_code) == 6{"\n\n"}
                      <span className="opacity-40"># Proceeding to password configuration...</span>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <span className="text-[#0d631b] font-bold">curl</span> -X POST \{"\n"}
                      {"  "}https://api.interviewos.io/auth/reset-password \{"\n"}
                      {"  "}-H <span className="text-[#2a6b2c]">'Content-Type: application/json'</span> \{"\n"}
                      {"  "}-d <span className="text-[#2a6b2c]">'&#123; "email": "{email}", "token": "{otp}" &#125;'</span>{"\n\n"}
                      <span className="opacity-40"># Submits OTP and new secure password</span>
                    </>
                  )}
                  {step === 4 && (
                    <>
                      <span className="opacity-40"># Secure connection closed</span>{"\n"}
                      <span className="opacity-40"># Redirecting user to login screen...</span>
                    </>
                  )}
                </motion.pre>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Right Section: Forgot Password Form Wizard */}
        <section className="w-full lg:w-1/2 flex flex-col items-center bg-[#f8faf8] p-8 min-h-0 relative justify-center py-8 overflow-y-auto h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#e8f5e9]/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0d631b]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-full max-w-[440px] relative z-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSendOtp}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-1 tracking-tight">Reset your password 🔐</h2>
                    <p className="text-sm text-muted-foreground">
                      Enter your email address and we'll send you a 6-digit OTP code.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5" htmlFor="forgot-email">
                        Work Email
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                        <input
                          id="forgot-email"
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError("");
                          }}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-white transition-all outline-none text-sm text-foreground"
                          required
                        />
                      </div>
                      {error && (
                        <p className="text-xs text-red-600 font-semibold mt-1" role="alert">
                          {error}
                        </p>
                      )}
                      {serverError && (
                        <div className="flex items-center gap-2 p-3 mt-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                          <AlertCircle size={16} className="shrink-0" />
                          <p>{serverError}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isEmailValid}
                    className="w-full py-3 bg-[#0d631b] hover:bg-[#094713] disabled:opacity-50 text-white rounded-xl font-semibold transition-all active:scale-95 duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2 border-t border-outline-variant/20">
                    <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                      <ArrowLeft size={16} /> Back to login
                    </Link>
                  </div>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-1 tracking-tight">Enter OTP Code ✉️</h2>
                    <p className="text-sm text-muted-foreground">
                      We've sent a 6-digit password reset code to:
                      <strong className="block text-primary mt-1 font-semibold break-all">{email}</strong>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5" htmlFor="otp-input">
                        6-Digit OTP Code
                      </label>
                      <div className="relative">
                        <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                        <input
                          id="otp-input"
                          type="text"
                          maxLength={6}
                          placeholder="••••••"
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value.replace(/\D/g, ""));
                            if (error) setError("");
                          }}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-white transition-all outline-none text-sm text-foreground tracking-[0.3em] font-semibold text-center"
                          required
                          autoComplete="one-time-code"
                        />
                      </div>
                      {error && (
                        <p className="text-xs text-red-600 font-semibold mt-1" role="alert">
                          {error}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!isOtpValid}
                    className="w-full py-3 bg-[#0d631b] hover:bg-[#094713] disabled:opacity-50 text-white rounded-xl font-semibold transition-all active:scale-95 duration-200 flex items-center justify-center gap-2"
                  >
                    Verify OTP <ArrowRight size={16} />
                  </button>

                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline bg-transparent border-none cursor-pointer"
                    >
                      <ArrowLeft size={16} /> Back to email
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleResetPassword}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-1 tracking-tight">Create new password 🔒</h2>
                    <p className="text-sm text-muted-foreground">
                      OTP Verified. Please configure your new password.
                    </p>
                  </div>

                  <div className="space-y-4">
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
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (error) setError("");
                          }}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-white transition-all outline-none text-sm text-foreground"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
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
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (error) setError("");
                          }}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-white transition-all outline-none text-sm text-foreground"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
                        >
                          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <p className="text-xs text-red-600 font-semibold mt-1" role="alert">
                        {error}
                      </p>
                    )}
                    {serverError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                        <AlertCircle size={16} className="shrink-0" />
                        <p>{serverError}</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isPasswordValid || !passwordsMatch}
                    className="w-full py-3 bg-[#0d631b] hover:bg-[#094713] disabled:opacity-50 text-white rounded-xl font-semibold transition-all active:scale-95 duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline bg-transparent border-none cursor-pointer"
                    >
                      <ArrowLeft size={16} /> Back to OTP
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#0d631b]/10 flex items-center justify-center text-primary mx-auto mb-6 animate-bounce">
                    <CheckCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 tracking-tight">Password reset! 🎉</h2>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Your password has been successfully changed. You can now log in with your new password.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-3 bg-[#0d631b] hover:bg-[#094713] text-white rounded-xl font-semibold transition-all active:scale-95 duration-200 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} /> Back to Login
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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

export default ForgotPasswordPage;
