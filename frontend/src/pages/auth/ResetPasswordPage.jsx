import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle, AlertCircle, ArrowLeft, Zap } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthLayout from "@/components/AuthLayout";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
    1: { label: "Weak", color: "#ef4444" },
    2: { label: "Fair", color: "#f97316" },
    3: { label: "Good", color: "#eab308" },
    4: { label: "Strong", color: "#22c55e" },
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

  const stagger = (i) => ({ delay: 0.15 + i * 0.06 });

  return (
    <AuthLayout variant="register">
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
            Create new password 🔐
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: "#888899" }}>
            Make it strong and keep it secure
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {/* Email */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(1)}
          >
            <label htmlFor="reset-email" className="ios-label">
              Email Address
            </label>
            <div className="relative">
              <input
                id="reset-email"
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

          {/* New Password */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(2)}
          >
            <label htmlFor="reset-password" className="ios-label">
              New Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#444455" }}
              />
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                className={`ios-input !pr-10 ${
                  errors.newPassword && touchedFields.newPassword ? "!border-red-500" : ""
                }`}
                placeholder="Enter new password"
                {...register("newPassword")}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
                style={{ color: "#444455" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Strength */}
            {newPassword && (
              <motion.div initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px]" style={{ color: "#888899" }}>
                    Strength:
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "#333344" }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(strength.level / 4) * 100}%` }}
                    style={{ backgroundColor: strength.color }}
                  />
                </div>
              </motion.div>
            )}

            {errors.newPassword && touchedFields.newPassword && (
              <motion.p
                initial={{ y: -4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[11px] mt-1"
                style={{ color: "#f87171" }}
                role="alert"
              >
                {errors.newPassword.message}
              </motion.p>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(3)}
          >
            <label htmlFor="reset-confirm" className="ios-label">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#444455" }}
              />
              <input
                id="reset-confirm"
                type={showConfirm ? "text" : "password"}
                className={`ios-input !pr-10 ${
                  errors.confirmPassword && touchedFields.confirmPassword ? "!border-red-500" : ""
                }`}
                placeholder="Confirm password"
                {...register("confirmPassword")}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
                style={{ color: "#444455" }}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && touchedFields.confirmPassword && (
              <motion.p
                initial={{ y: -4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[11px] mt-1"
                style={{ color: "#f87171" }}
                role="alert"
              >
                {errors.confirmPassword.message}
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

          {/* Password Tips */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(4)}
            className="p-3 rounded-lg flex gap-3"
            style={{ backgroundColor: "#222233" }}
          >
            <Zap size={16} style={{ color: "#6366f1", flexShrink: 0 }} className="mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold mb-1.5" style={{ color: "#ededf0" }}>
                Password requirements:
              </p>
              <ul className="text-[11px] space-y-0.5" style={{ color: "#888899" }}>
                <li>✓ At least 8 characters</li>
                <li>✓ Uppercase & lowercase letters</li>
                <li>✓ At least one number</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Submit Button */}
        <motion.button
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={stagger(5)}
          type="submit"
          disabled={loading || reset}
          className="mt-6 w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: "#6366f1",
            color: "#ededf0",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Resetting...
            </>
          ) : reset ? (
            <>
              <CheckCircle size={16} />
              Password reset!
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>

        {/* Back to Login */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={stagger(6)}
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

export default ResetPasswordPage;
