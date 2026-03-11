import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Loader2,
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
import { loginSchema, type LoginFormData } from "@/lib/validations";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  const loginAction = useAuthStore((s) => s.login);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const emailValue = watch("email");
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
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
      sessionStorage.setItem("justLoggedIn", "true");
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate(
        user.role === "interviewer"
          ? "/dashboard/interviewer"
          : "/dashboard/candidate",
      );
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.message || "Invalid email or password";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setError("");
        setLoading(true);
        // By default, assuming role is handled backend or we pass a generic one for login
        // If login needs role, backend usually infers it for existing google users
        const res = await api.post("/auth/google", {
          token: tokenResponse.access_token,
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
        sessionStorage.setItem("justLoggedIn", "true");
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
    onError: () => setServerError("Google sign-in failed. Please try again."),
  });

  const stagger = (i: number) => ({ delay: 0.15 + i * 0.06 });

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
            Welcome back 👋
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: "#888899" }}>
            Sign in to your InterviewOS account
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {/* Email */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(1)}
          >
            <label htmlFor="login-email" className="ios-label">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#444455" }}
              />
              <input
                id="login-email"
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

          {/* Password */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(2)}
          >
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="login-password" className="ios-label !mb-0">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium transition-colors hover:brightness-125"
                style={{ color: "#6366f1" }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#444455" }}
              />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className={`ios-input !pr-10 ${errors.password && touchedFields.password ? "!border-red-500" : ""}`}
                placeholder="Enter your password"
                {...register("password")}
                autoComplete="current-password"
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
              <motion.p
                initial={{ y: -4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[11px] mt-1"
                style={{ color: "#f87171" }}
                role="alert"
              >
                {errors.password.message}
              </motion.p>
            )}
          </motion.div>

          {/* Server Error */}
          {serverError && (
            <motion.p
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-[11px]"
              style={{ color: "#f87171" }}
              role="alert"
            >
              {serverError}
            </motion.p>
          )}

          {/* Remember me */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={stagger(3)}
            className="flex items-center gap-2"
          >
            <input
              type="checkbox"
              id="remember"
              className="ios-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label
              htmlFor="remember"
              className="text-[13px] cursor-pointer"
              style={{ color: "#888899" }}
            >
              Remember me
            </label>
          </motion.div>
        </div>

        {/* Sign in button */}
        <motion.button
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={stagger(4)}
          type="submit"
          className="ios-btn-primary mt-6"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>

        {/* Divider */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={stagger(5)}
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
          transition={stagger(6)}
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
          transition={stagger(7)}
          className="text-center text-[13px] mt-5"
          style={{ color: "#666677" }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold transition-colors hover:brightness-125"
            style={{ color: "#6366f1" }}
          >
            Sign up
          </Link>
        </motion.p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
