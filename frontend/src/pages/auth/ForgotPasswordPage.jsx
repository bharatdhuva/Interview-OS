import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthLayout from "@/components/AuthLayout";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
        title: "Check your email! 📧",
        description: "We've sent a password reset link.",
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to process request. Please try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const stagger = (i) => ({ delay: 0.15 + i * 0.06 });

  if (submitted) {
    return (
      <AuthLayout variant="login">
        <div className="flex flex-col items-center justify-center py-8">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="mb-6"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(99, 102, 241, 0.1)" }}
            >
              <CheckCircle size={32} style={{ color: "#6366f1" }} />
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(0)}
            className="text-center mb-4"
          >
            <h1
              className="text-[22px] font-bold"
              style={{ color: "#ededf0", letterSpacing: "-0.03em" }}
            >
              Check your email! 🔗
            </h1>
            <p className="text-[13px] mt-2" style={{ color: "#888899" }}>
              We've sent a password reset link to your email address. <br />
              Click the link to create a new password.
            </p>
          </motion.div>

          {/* Email Display */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(1)}
            className="mt-6 p-4 rounded-lg w-full"
            style={{ backgroundColor: "#222233" }}
          >
            <p className="text-[12px] text-center" style={{ color: "#888899" }}>
              Email sent to
            </p>
            <p className="text-[14px] font-semibold text-center mt-1" style={{ color: "#6366f1" }}>
              {emailValue}
            </p>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(2)}
            className="mt-6 p-3 rounded-lg w-full flex gap-3"
            style={{ backgroundColor: "rgba(99, 102, 241, 0.05)", borderLeft: "3px solid #6366f1" }}
          >
            <AlertCircle size={16} style={{ color: "#6366f1", flexShrink: 0 }} className="mt-0.5" />
            <div>
              <p className="text-[12px]" style={{ color: "#888899" }}>
                The reset link will expire in <span style={{ color: "#ededf0", fontWeight: "600" }}>1 hour</span>. <br />
                If you don't see the email, check your spam folder.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(3)}
            className="mt-8 w-full flex gap-3"
          >
            <button
              onClick={() => navigate("/login")}
              className="flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: "#333344",
                color: "#ededf0",
              }}
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </motion.div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="login">
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
            Reset your password 🔐
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: "#888899" }}>
            Enter your email address and we'll send you a reset link
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {/* Email */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(1)}
          >
            <label htmlFor="forgot-email" className="ios-label">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#444455" }}
              />
              <input
                id="forgot-email"
                type="email"
                className={`ios-input ${errors.email && touchedFields.email ? "!border-red-500" : ""}`}
                placeholder="you@example.com"
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
        </div>

        {/* Submit Button */}
        <motion.button
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={stagger(2)}
          type="submit"
          disabled={loading || !isEmailValid}
          className="mt-6 w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "#6366f1",
            color: "#ededf0",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Reset Link
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>

        {/* Back to Login */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={stagger(3)}
          className="mt-6 text-center border-t"
          style={{ borderColor: "#333344" }}
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-1 mt-4 text-[13px] font-semibold transition-colors hover:brightness-125"
            style={{ color: "#6366f1" }}
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </motion.div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
