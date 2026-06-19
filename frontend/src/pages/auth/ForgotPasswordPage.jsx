import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import AuthNavbar from "@/components/AuthNavbar";


const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { register, handleSubmit, watch, formState: { errors, touchedFields } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
    },
  });

  const emailValue = watch("email");
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", {
        email: data.email,
      });
      setSubmitted(true);
      toast({
        title: "OTP Sent! 📧",
        description: "We've sent a 6-digit password reset code to your email.",
      });
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to process request. Please try again.";
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

            {/* Code Snippet Card */}
            <div className="glass-effect rounded-2xl p-6 border border-emerald-800/20 shadow-2xl overflow-hidden text-[#40493d]">
              <div className="flex items-center gap-2 mb-4 border-b border-outline-variant/10 pb-3">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-2 font-mono text-[12px] opacity-60">recovery_agent.sh</span>
              </div>
              <pre className="font-mono text-sm leading-relaxed text-[#40493d]">
                <span className="text-[#0d631b] font-bold">curl</span> -X POST \{"\n"}
                {"  "}https://api.interviewos.io/auth/forgot-password \{"\n"}
                {"  "}-H <span className="text-[#2a6b2c]">'Content-Type: application/json'</span> \{"\n"}
                {"  "}-d <span className="text-[#2a6b2c]">'&#123; "email": "{emailValue || "you@example.com"}" &#125;'</span>{"\n\n"}
                <span className="opacity-40"># Sent 6-digit OTP code via email</span>
              </pre>
            </div>
          </div>
        </section>

        {/* Right Section: Forgot Password Form */}
        <section className="w-full lg:w-1/2 flex flex-col items-center bg-[#f8faf8] p-8 min-h-0 relative justify-center py-8 overflow-y-auto h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#e8f5e9]/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0d631b]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-full max-w-[440px] relative z-10">

            {submitted ? (
              <div className="flex flex-col text-center">
                <div className="w-16 h-16 rounded-full bg-[#0d631b]/10 flex items-center justify-center text-primary mx-auto mb-6 animate-bounce">
                  <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 tracking-tight">Check your email! 📧</h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  We've sent a password reset link to your email address:
                  <strong className="block text-primary mt-2 font-semibold break-all">{emailValue}</strong>
                </p>
                <div className="p-3 bg-[#e8f5e9]/30 border border-primary/20 rounded-xl flex gap-3 text-left mb-6">
                  <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-normal">
                    The reset link will expire in <strong>1 hour</strong>. Check your spam folder if you do not see the message.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-[#0d631b] hover:bg-[#094713] text-white rounded-xl font-semibold transition-all active:scale-95 duration-200 flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 tracking-tight">Reset your password 🔐</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your email address and we'll send you a reset link.
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
                        {...register("email")}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-white transition-all outline-none text-sm text-foreground"
                      />
                    </div>
                    {errors.email && touchedFields.email && (
                      <p className="text-xs text-red-600 font-semibold mt-1" role="alert">
                        {errors.email.message}
                      </p>
                    )}
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
                  disabled={loading || !isEmailValid}
                  className="w-full py-3 bg-[#0d631b] hover:bg-[#094713] disabled:opacity-50 text-white rounded-xl font-semibold transition-all active:scale-95 duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="text-center pt-2 border-t border-outline-variant/20">
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                    <ArrowLeft size={16} /> Back to login
                  </Link>
                </div>
              </form>
            )}
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
