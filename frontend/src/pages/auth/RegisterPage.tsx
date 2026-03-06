import React, { useState, useMemo } from "react";
  // ...existing code...
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Loader2,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/lib/api";
import { registerSchema, type RegisterFormData } from "@/lib/validations";

/* ─── Password strength ─── */
const getPasswordStrength = (
  pw: string,
): { level: number; label: string; color: string } => {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const map: Record<number, { label: string; color: string }> = {
    1: { label: "Weak", color: "#ef4444" },
    2: { label: "Fair", color: "#f97316" },
    3: { label: "Good", color: "#eab308" },
    4: { label: "Strong", color: "#22c55e" },
  };
  const clamped = Math.max(1, Math.min(4, score));
  return { level: clamped, ...map[clamped] };
};

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  const loginAction = useAuthStore((s) => s.login);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "candidate",
      termsAccepted: false as unknown as true,
    },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");
  const roleValue = watch("role");
  const termsValue = watch("termsAccepted");
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  const strength = useMemo(() => getPasswordStrength(passwordValue), [passwordValue]);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: data.fullName.trim(),
        email: data.email.trim(),
        password: data.password,
        role: data.role,
      });
      const d = res.data.data;
      const user = {
        id: d.id,
        name: d.name,
        email: d.email,
        role: d.role,
        avatar: d.avatar || "",
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };
      loginAction(user, d.accessToken);
      toast({
        title: "Account created!",
        description: "Welcome to InterviewOS.",
      });
      navigate(
        user.role === "interviewer"
          ? "/dashboard/interviewer"
          : "/dashboard/candidate",
      );
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.message || "Something went wrong";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setServerError("");
        setLoading(true);
        const res = await api.post("/auth/google", {
          token: tokenResponse.access_token,
          role: roleValue,
        });
        const d = res.data.data;
        const user = {
          id: d.id,
          name: d.name,
          email: d.email,
          role: d.role,
          avatar: d.avatar || "",
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
        };
        loginAction(user, d.accessToken);
        toast({ title: `Welcome, ${user.name}!` });
        navigate(
          user.role === "interviewer"
            ? "/dashboard/interviewer"
            : "/dashboard/candidate",
        );
      } catch (err: unknown) {
        setServerError(
          (err as any)?.response?.data?.message ||
            "Google authentication failed",
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => setServerError("Google signup failed. Please try again."),
  });

  const stagger = (i: number) => ({ delay: 0.15 + i * 0.06 });

  return (
    <AuthLayout variant="register">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col" style={{ overflow: 'hidden', maxHeight: '100vh' }}>
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
            Create your account 🚀
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: "#888899" }}>
            Join 10,000+ developers &amp; interviewers
          </p>
        </motion.div>

        <div className="flex flex-col gap-3.5">
          {/* Full Name */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(1)}
          >
            <label htmlFor="reg-name" className="ios-label">
              Full Name <span style={{ color: "#f87171" }}>*</span>
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#444455" }}
              />
              <input
                id="reg-name"
                type="text"
                className={`ios-input ${errors.fullName && touchedFields.fullName ? "!border-red-500" : ""}`}
                placeholder="Enter your full name"
                {...register("fullName")}
                autoComplete="name"
              />
            </div>
            {errors.fullName && touchedFields.fullName && (
              <motion.p initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] mt-1" style={{ color: "#f87171" }} role="alert">
                {errors.fullName.message}
              </motion.p>
            )}
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(2)}
          >
            <label htmlFor="reg-email" className="ios-label">
              Email Address <span style={{ color: "#f87171" }}>*</span>
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#444455" }}
              />
              <input
                id="reg-email"
                type="email"
                className={`ios-input ${errors.email && touchedFields.email ? "!border-red-500" : ""}`}
                placeholder="you@example.com"
                {...register("email")}
                autoComplete="email"
              />
              {isEmailValid && !errors.email && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Check size={16} style={{ color: "#22c55e" }} />
                </motion.div>
              )}
            </div>
            {errors.email && touchedFields.email && (
              <motion.p initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] mt-1" style={{ color: "#f87171" }} role="alert">
                {errors.email.message}
              </motion.p>
            )}
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(3)}
          >
            <label htmlFor="reg-password" className="ios-label">
              Password <span style={{ color: "#f87171" }}>*</span>
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#444455" }}
              />
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                className={`ios-input !pr-10 ${errors.password && touchedFields.password ? "!border-red-500" : ""}`}
                placeholder="Min 8 chars, 1 letter, 1 number"
                {...register("password")}
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
            {errors.password && touchedFields.password && (
              <motion.p initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] mt-1" style={{ color: "#f87171" }} role="alert">
                {errors.password.message}
              </motion.p>
            )}
            {passwordValue.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col mt-2"
              >
                <div className="w-full h-[8px] rounded-xl bg-[#23233a] overflow-hidden shadow-sm">
                  <div
                    className="h-full rounded-xl transition-all duration-300"
                    style={{
                      width: `${(strength.level / 4) * 100}%`,
                      background: strength.level === 4
                        ? '#7c3aed'
                        : strength.level === 3
                        ? '#6366f1'
                        : strength.level === 2
                        ? '#f59e42'
                        : '#ef4444',
                    }}
                  />
                </div>
                <span
                  className="text-[12px] font-semibold mt-1 tracking-wide"
                  style={{ color: strength.level === 4
                    ? '#a5b4fc'
                    : strength.level === 3
                    ? '#818cf8'
                    : strength.level === 2
                    ? '#fbbf24'
                    : '#f87171' }}
                >
                  {strength.label}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(3.5)}
          >
            <label htmlFor="reg-confirm-password" className="ios-label">
              Confirm Password <span style={{ color: "#f87171" }}>*</span>
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#444455" }}
              />
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className={`ios-input !pr-10 ${errors.confirmPassword && touchedFields.confirmPassword ? "!border-red-500" : ""}`}
                placeholder="Re-enter your password"
                {...register("confirmPassword")}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
                style={{ color: "#444455" }}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && touchedFields.confirmPassword && (
              <motion.p initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] mt-1" style={{ color: "#f87171" }} role="alert">
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </motion.div>

          {/* Role toggle */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(4)}
          >
            <label className="ios-label">I Am A <span style={{ color: "#f87171" }}>*</span></label>
            <div className="flex gap-2">
              {(["candidate", "interviewer"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setValue("role", r, { shouldValidate: true })}
                  className="flex-1 h-10 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150"
                  style={{
                    background:
                      roleValue === r
                        ? "rgba(99,102,241,0.12)"
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${roleValue === r ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.08)"}`,
                    color: roleValue === r ? "#a5b4fc" : "#888899",
                  }}
                >
                  {r === "candidate" ? "👨‍💻 Candidate" : "🎯 Interviewer"}
                </button>
              ))}
            </div>
            {errors.role && (
              <motion.p initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] mt-1" style={{ color: "#f87171" }} role="alert">
                {errors.role.message}
              </motion.p>
            )}
          </motion.div>

          {/* Terms */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(5)}
            className="flex flex-col"
          >
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="ios-checkbox mt-0.5"
                checked={termsValue === true}
                onChange={(e) => {
                  setValue("termsAccepted", e.target.checked as unknown as true, { shouldValidate: true });
                }}
              />
              <label
                htmlFor="terms"
                className="text-xs cursor-pointer leading-relaxed"
                style={{ color: "#888899" }}
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium"
                  style={{ color: "#6366f1" }}
                >
                  Terms
                </a>
                {" & "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium"
                  style={{ color: "#6366f1" }}
                >
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.termsAccepted && (
              <motion.p initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] mt-1" style={{ color: "#f87171" }} role="alert">
                {errors.termsAccepted.message}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Server Error */}
        {serverError && (
          <motion.p
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-[11px] mt-3"
            style={{ color: "#f87171" }}
            role="alert"
          >
            {serverError}
          </motion.p>
        )}

        {/* Submit */}
        <motion.button
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={stagger(6)}
          type="submit"
          className="ios-btn-primary mt-5"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>

        {/* Divider */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={stagger(7)}
          className="ios-divider my-5"
        >
          <span className="text-xs" style={{ color: "#444455" }}>
            or
          </span>
        </motion.div>

        {/* Google */}
        <motion.button
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={stagger(8)}
          type="button"
          className="ios-btn-social"
          onClick={() => handleGoogle()}
          disabled={loading}
        >
          <GoogleIcon size={20} />
          Continue with Google
        </motion.button>

        {/* Footer */}
        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={stagger(9)}
          className="text-center text-[13px] mt-5"
          style={{ color: "#666677" }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold transition-colors hover:brightness-125"
            style={{ color: "#6366f1" }}
          >
            Sign in
          </Link>
        </motion.p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
