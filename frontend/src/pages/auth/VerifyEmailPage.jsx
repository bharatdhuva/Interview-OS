import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthLayout from "@/components/AuthLayout";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";

const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string().min(1, "Verification code is required"),
});

const VerifyEmailPage = () => {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [serverError, setServerError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const storedEmail = sessionStorage.getItem("verifyEmail");
  
  const { register, handleSubmit, watch, formState: { errors, touchedFields } } = useForm({
    resolver: zodResolver(verifyEmailSchema),
    mode: "onTouched",
    defaultValues: {
      email: storedEmail || authUser?.email || "",
      token: "",
    },
  });

  // Redirect away as verification is now skipped
  useEffect(() => {
    navigate("/");
  }, [navigate]);

  const emailValue = watch("email");
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  /* Countdown timer for resend */
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-email", {
        email: data.email,
        token: data.token,
      });
      setVerified(true);
      toast({
        title: "Email verified! 🎉",
        description: "Your account is now active. Redirecting to login...",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid verification code. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!emailValue || !isEmailValid) {
      setServerError("Please enter a valid email address");
      return;
    }
    setServerError("");
    setResending(true);
    try {
      await api.post("/auth/resend-verification", {
        email: emailValue,
      });
      setResendSuccess(true);
      setCountdown(60);
      toast({
        title: "Email sent ✉️",
        description: "Check your inbox for a new verification code.",
      });
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to resend email. Please try again.";
      setServerError(msg);
    } finally {
      setResending(false);
    }
  };

  const stagger = (i) => ({ delay: 0.15 + i * 0.06 });

  return (
    <AuthLayout variant="register">
      <div className="verify-container w-full h-full flex flex-col">
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
          .verify-container {
            font-family: 'Montserrat', sans-serif;
          }
        ` }} />
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(0)}
            className="text-center mb-7"
          >
            <h1
              className="text-[22px] font-bold"
              style={{ color: "#ededf0", letterSpacing: "-0.03em" }}
            >
              Verify your email ✉️
            </h1>
            <p className="text-[13px] mt-1.5" style={{ color: "#888899" }}>
              We've sent a verification code to your email
            </p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={stagger(1)}
            >
              <label htmlFor="verify-email" className="ios-label">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#444455" }}
                />
                <input
                  id="verify-email"
                  type="email"
                  className={`ios-input ${errors.email && touchedFields.email ? "!border-red-500" : ""}`}
                  placeholder="your@email.com"
                  {...register("email")}
                  autoComplete="email"
                />
              </div>
              {errors.email && touchedFields.email && (
                <motion.p
                  initial={{ y: -4, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-[11px] mt-1"
                  style={{ color: "#f87171" }}
                  role="alert"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* Verification Code */}
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={stagger(2)}
            >
              <label htmlFor="verify-code" className="ios-label">
                Verification Code
              </label>
              <input
                id="verify-code"
                type="text"
                className={`ios-input text-center text-lg tracking-widest ${
                  errors.token && touchedFields.token ? "!border-red-500" : ""
                }`}
                placeholder="000000"
                maxLength="6"
                {...register("token")}
                autoComplete="off"
              />
              {errors.token && touchedFields.token && (
                <motion.p
                  initial={{ y: -4, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-[11px] mt-1"
                  style={{ color: "#f87171" }}
                  role="alert"
                >
                  {errors.token.message}
                </motion.p>
              )}
            </motion.div>

            {/* Server Error */}
            {serverError && (
              <motion.div
                initial={{ y: -4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{ backgroundColor: "rgba(248, 113, 113, 0.1)", borderLeft: "3px solid #f87171" }}
              >
                <AlertCircle size={16} style={{ color: "#f87171" }} />
                <p className="text-[12px]" style={{ color: "#f87171" }}>
                  {serverError}
                </p>
              </motion.div>
            )}

            {/* Resend Success */}
            {resendSuccess && (
              <motion.div
                initial={{ y: -4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", borderLeft: "3px solid #22c55e" }}
              >
                <CheckCircle size={16} style={{ color: "#22c55e" }} />
                <p className="text-[12px]" style={{ color: "#22c55e" }}>
                  Verification email sent! Check your inbox.
                </p>
              </motion.div>
            )}

            {/* Verified Success */}
            {verified && (
              <motion.div
                initial={{ y: -4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", borderLeft: "3px solid #22c55e" }}
              >
                <CheckCircle size={16} style={{ color: "#22c55e" }} />
                <p className="text-[12px]" style={{ color: "#22c55e" }}>
                  Email verified successfully! Redirecting...
                </p>
              </motion.div>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(3)}
            type="submit"
            disabled={loading || verified}
            className="mt-6 ios-btn-primary"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verifying...
              </>
            ) : verified ? (
              <>
                <CheckCircle size={16} />
                Verified!
              </>
            ) : (
              <>
                Verify Email
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>

          {/* Resend Link */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(4)}
            className="mt-4 text-center"
          >
            <p className="text-[13px]" style={{ color: "#888899" }}>
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendVerificationEmail}
                disabled={resending || countdown > 0}
                className="font-bold text-[#0d631b] hover:underline disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none outline-none cursor-pointer"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : resending ? "Sending..." : "Resend code"}
              </button>
            </p>
          </motion.div>

          {/* Login Link */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(5)}
            className="mt-6 text-center border-t"
            style={{ borderColor: "#333344" }}
          >
            <p className="text-[13px] mt-4" style={{ color: "#888899" }}>
              Already verified?{" "}
              <Link to="/login" className="text-[#0d631b] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
