import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/lib/api";
import { loginSchema } from "@/lib/validations";
import AuthNavbar from "@/components/layout/AuthNavbar";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const loginAction = useAuthStore((s) => s.login);

  useEffect(() => {
    let targetUrl = "";
    if (location.state?.from) {
      if (typeof location.state.from === "string") {
        targetUrl = location.state.from;
      } else {
        const fromLoc = location.state.from;
        targetUrl =
          fromLoc.pathname + (fromLoc.search || "") + (fromLoc.hash || "");
      }
    }
    if (!targetUrl) {
      const params = new URLSearchParams(window.location.search);
      targetUrl = params.get("redirect") || params.get("from") || "";
    }

    if (targetUrl) {
      sessionStorage.setItem("redirectUrl", targetUrl);
    } else {
      const params = new URLSearchParams(window.location.search);
      if (!params.has("code")) {
        sessionStorage.removeItem("redirectUrl");
      }
    }
  }, [location]);

  const handlePostLoginRedirect = (user) => {
    if (user.isOnboarded === false) {
      navigate("/onboarding");
    } else {
      const redirectUrl = sessionStorage.getItem("redirectUrl");
      if (redirectUrl) {
        sessionStorage.removeItem("redirectUrl");
        navigate(redirectUrl);
      } else {
        navigate(
          user.role === "interviewer"
            ? "/dashboard/interviewer"
            : "/dashboard/candidate"
        );
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      const loginWithGithub = async () => {
        setServerError("");
        setLoading(true);
        try {
          const res = await api.post("/auth/github", { code });
          const d = res.data.data;
          const user = {
            id: d.id,
            name: d.name,
            email: d.email,
            role: d.role,
            avatar: d.avatar || "",
            isEmailVerified: true,
            isOnboarded: d.isOnboarded,
            createdAt: new Date().toISOString(),
          };
          loginAction(user, d.accessToken);
          sessionStorage.setItem("justLoggedIn", "true");
          window.history.replaceState({}, document.title, window.location.pathname);
          handlePostLoginRedirect(user);
        } catch (err) {
          setServerError(
            err?.response?.data?.message || "GitHub authentication failed"
          );
          window.history.replaceState({}, document.title, window.location.pathname);
        } finally {
          setLoading(false);
        }
      };
      loginWithGithub();
    }
  }, [loginAction, navigate]);

  const handleGithub = () => {
    const clientId =
      import.meta.env.VITE_GITHUB_CLIENT_ID || "your_github_client_id_here";
    const redirectUri = `${window.location.origin}/login`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
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
        isOnboarded: d.isOnboarded,
        createdAt: new Date().toISOString(),
      };
      loginAction(user, d.accessToken);
      sessionStorage.setItem("justLoggedIn", "true");
      handlePostLoginRedirect(user);
    } catch (err) {
      setServerError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setServerError("");
      setLoading(true);
      try {
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
          isOnboarded: d.isOnboarded,
          createdAt: new Date().toISOString(),
        };
        loginAction(user, d.accessToken);
        sessionStorage.setItem("justLoggedIn", "true");
        handlePostLoginRedirect(user);
      } catch (err) {
        setServerError(
          err?.response?.data?.message || "Google authentication failed"
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setServerError("Google sign-in was cancelled or failed");
    },
  });

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-[#fafbf9] text-[#171917]"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
      }}
    >
      <AuthNavbar pageType="login" />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-74px)]">
        {/* Left Panel: Editorial + Code Preview (matching Landing Page) */}
        <section
          className="hidden lg:flex flex-col justify-start items-center px-12 xl:px-20 pt-14 pb-10 border-r border-[#e2e7e1]"
          style={{
            background:
              "radial-gradient(ellipse at 25% 15%, rgba(202, 250, 222, 0.72), transparent 55%), linear-gradient(180deg, #f5fbf6 0%, #fafbf9 100%)",
          }}
        >
          <div className="max-w-[500px] w-full">
            <p className="text-[11.5px] uppercase tracking-[0.13em] text-[#657168] mb-4 font-sans">
              Live technical interviews
            </p>
            <h1
              className="text-[48px] leading-[1.0] font-semibold tracking-[-0.05em] text-[#171917] mb-4"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
            >
              Beyond the code.
              <br />
              <span className="text-[#008a52]">See how they think.</span>
            </h1>
            <p className="text-[16px] text-[#566059] leading-[1.65] mb-8 font-sans">
              One shared space for real-time code, whiteboard collaboration, and evidence-linked evaluation drafts.
            </p>

            <div className="rounded-xl border border-[#d9e0da] bg-white overflow-hidden shadow-[0_18px_50px_rgba(20,31,23,0.06)]">
              <div className="h-10 px-4 border-b border-[#e6eae6] flex items-center gap-2 text-[11px] text-[#525d54]">
                <span className="w-2 h-2 rounded-full bg-[#00c875]" />
                <span>solution.ts</span>
                <span className="ml-auto text-[#238451] text-[10px] tracking-wider">● LIVE</span>
              </div>
              <pre className="p-4 text-[11.5px] leading-[1.75] text-[#343c36] font-mono bg-[#fbfcfb] overflow-x-auto">
                <span className="text-[#8b4f27]">async function</span>{" "}
                <span className="text-[#147b4a]">evaluateSession</span>(room) {"{\n"}
                {"  "}<span className="text-[#8b4f27]">const</span> context ={" "}
                <span className="text-[#8b4f27]">await</span> assembleContext(room);{"\n"}
                {"  "}<span className="text-[#8b4f27]">return</span> aiEvaluator.draft(context);{"\n"}
                {"}"}
              </pre>
              <div className="px-4 py-2.5 border-t border-[#e5eae5] flex items-center justify-between text-[11px] text-[#4a564d]">
                <span className="uppercase tracking-wider text-[10px] text-[#858e86]">Output</span>
                <span>
                  Tests passed <b className="text-[#16804c] font-semibold">4 / 4</b>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel: Sign In Form */}
        <section className="flex flex-col justify-start items-center px-6 sm:px-10 pt-14 pb-10 bg-[#fafbf9]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px]"
          >
            <header className="mb-6">
              <p className="text-[11.5px] uppercase tracking-[0.13em] text-[#657168] mb-2 font-sans">
                Welcome back
              </p>
              <h2
                className="text-[34px] leading-[1.08] font-semibold tracking-[-0.04em] text-[#171917]"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
              >
                Sign in to <span className="text-[#008a52]">InterviewOS</span>
              </h2>
              <p className="text-[14.5px] text-[#566059] mt-2 font-sans">
                Enter your credentials to access your dashboard.
              </p>
            </header>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  className="block text-[13px] font-medium text-[#414740] mb-1.5"
                  htmlFor="email"
                >
                  Work Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707870]"
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    {...register("email")}
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e7e1] bg-white text-[14px] text-[#171917] placeholder:text-[#828b83] focus:outline-none focus:border-[#008a52] focus:ring-1 focus:ring-[#008a52] transition-colors"
                  />
                </div>
                {errors.email && touchedFields.email && (
                  <p className="text-xs text-[#ba1a1a] mt-1" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    className="text-[13px] font-medium text-[#414740]"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[13px] font-medium text-[#008a52] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707870]"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e2e7e1] bg-white text-[14px] text-[#171917] placeholder:text-[#828b83] focus:outline-none focus:border-[#008a52] focus:ring-1 focus:ring-[#008a52] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#707870] hover:text-[#171917] transition-colors bg-transparent border-none cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && touchedFields.password && (
                  <p className="text-xs text-[#ba1a1a] mt-1" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <div
                  className="p-3 rounded-xl bg-[#ffdad6]/40 border border-[#ba1a1a]/25 text-xs text-[#ba1a1a] font-medium"
                  role="alert"
                >
                  {serverError}
                </div>
              )}

              <div className="flex items-center gap-2.5 py-0.5">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#bfcaba] text-[#008a52] focus:ring-[#00c875] h-4 w-4 cursor-pointer"
                />
                <label
                  className="text-[13px] text-[#566059] cursor-pointer select-none"
                  htmlFor="remember"
                >
                  Remember this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[46px] rounded-full bg-[#080a09] hover:bg-[#242925] disabled:opacity-50 text-white text-[14px] font-semibold transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In <span aria-hidden="true">↗</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e2e7e1]" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-[0.1em]">
                <span className="bg-[#fafbf9] px-3 text-[#707870]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleGoogle()}
                disabled={loading}
                className="flex-1 min-h-[42px] flex items-center justify-center gap-2 border border-[#e2e7e1] rounded-full bg-white hover:bg-[#eef5ef] transition-all text-[13px] font-semibold text-[#171917] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={handleGithub}
                disabled={loading}
                className="flex-1 min-h-[42px] flex items-center justify-center gap-2 border border-[#e2e7e1] rounded-full bg-white hover:bg-[#eef5ef] transition-all text-[13px] font-semibold text-[#171917] cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>

            <p className="mt-6 text-center text-[13px] text-[#566059]">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#008a52] font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
