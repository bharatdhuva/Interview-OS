import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/lib/api";
import { loginSchema } from "@/lib/validations";
import AuthNavbar from "@/components/AuthNavbar";


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
        targetUrl = fromLoc.pathname + (fromLoc.search || "") + (fromLoc.hash || "");
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
        navigate(user.role === "interviewer" ? "/dashboard/interviewer" : "/dashboard/candidate");
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
          const res = await api.post("/auth/github", {
            code,
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
          window.history.replaceState({}, document.title, window.location.pathname);
          handlePostLoginRedirect(user);
        } catch (err) {
          setServerError(err?.response?.data?.message || "GitHub authentication failed");
          window.history.replaceState({}, document.title, window.location.pathname);
        } finally {
          setLoading(false);
        }
      };
      loginWithGithub();
    }
  }, [loginAction, navigate]);

  const handleGithub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || "your_github_client_id_here";
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
      const msg = err?.response?.data?.message || "Invalid email or password";
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
        setServerError(err?.response?.data?.message || "Google authentication failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setServerError("Google sign-in failed. Please try again."),
  });

  return (
    <div className="login-container h-screen w-full flex flex-col relative overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        :root {
          --outline-variant: #bfcaba;
          --on-secondary-container: #307231;
          --surface-bright: #f8faf8;
          --on-surface-variant: #40493d;
          --tertiary-container: #1d622b;
          --on-surface: #191c1b;
          --secondary: #2a6b2c;
          --surface-container-low: #f2f4f2;
          --error-container: #ffdad6;
          --surface-container-high: #e6e9e7;
          --surface-container-highest: #e1e3e1;
          --on-primary-fixed-variant: #005312;
          --background: #f8faf8;
          --on-tertiary: #ffffff;
          --surface-variant: #e1e3e1;
          --secondary-container: #aaf1a2;
          --surface-container: #eceeec;
          --surface-tint: #1b6d24;
          --on-tertiary-fixed-variant: #07521d;
          --primary-fixed: #a3f69c;
          --on-primary-container: #8bdd86;
          --tertiary-fixed: #abf4ad;
          --surface-container-lowest: #ffffff;
          --on-error: #ffffff;
          --surface: #f8faf8;
          --on-primary-fixed: #002203;
          --on-tertiary-container: #94dc97;
          --secondary-fixed-dim: #92d78b;
          --primary-container: #0d631b;
          --primary: #0d631b;
          --on-background: #191c1b;
          --on-secondary-fixed: #002203;
          --inverse-primary: #88d982;
          --tertiary-fixed-dim: #90d793;
          --error: #ba1a1a;
          --on-primary: #ffffff;
          --tertiary: #004918;
          --inverse-on-surface: #eff1ef;
          --primary-fixed-dim: #88d982;
          --outline: #707a6c;
          --surface-dim: #d8dad9;
          --inverse-surface: #2e3130;
          --on-secondary: #ffffff;
          --on-tertiary-fixed: #002107;
          --on-secondary-fixed-variant: #0d5216;
          --on-error-container: #93000a;
          --secondary-fixed: #adf4a5;
        }

        .login-container {
          font-family: 'Montserrat', sans-serif;
          background-color: var(--background);
          color: var(--on-surface);
        }

        .glass-effect {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.85);
        }

        /* Custom Spacing Rules */
        .p-xl { padding: 32px !important; }
        .p-md { padding: 12px !important; }
        .py-md { padding-top: 10px !important; padding-bottom: 10px !important; }
        .py-sm { padding-top: 8px !important; padding-bottom: 8px !important; }
        .px-md { padding-left: 16px !important; padding-right: 16px !important; }
        .p-margin-mobile { padding: 16px !important; }
        .p-margin-desktop { padding: 32px !important; }
        .gap-base { gap: 8px !important; }
        .gap-sm { gap: 12px !important; }
        .gap-md { gap: 16px !important; }
        .gap-xs { gap: 4px !important; }
        .mt-xl { margin-top: 24px !important; }
        .mb-lg { margin-bottom: 20px !important; }
        .mb-md { margin-bottom: 16px !important; }
        .mb-sm { margin-bottom: 8px !important; }
        .mb-xs { margin-bottom: 4px !important; }

        /* Custom Color classes override */
        .bg-primary { background-color: #0d631b !important; }
        .text-on-primary { color: #ffffff !important; }
        .text-primary-fixed { color: #a3f69c !important; }
        .border-on-primary-fixed-variant { border-color: #005312 !important; }
        .bg-surface { background-color: #f8faf8 !important; }
        .text-on-surface { color: #191c1b !important; }
        .text-on-surface-variant { color: #40493d !important; }
        .border-outline-variant\/30 { border-color: rgba(191, 202, 186, 0.3) !important; }
        .bg-surface-container-lowest { background-color: #ffffff !important; }
        .focus\:border-primary:focus { border-color: #0d631b !important; }
        .focus\:ring-primary:focus { --tw-ring-color: #0d631b !important; }
        .text-secondary { color: #307231 !important; }
        .text-primary { color: #0d631b !important; }
        .bg-surface-container { background-color: #eceeec !important; }
        .bg-outline-variant { background-color: #bfcaba !important; }
        .bg-error { background-color: #ba1a1a !important; }
        .bg-secondary-fixed-dim { background-color: #92d78b !important; }
        .bg-secondary { background-color: #2e7d32 !important; }
        .bg-surface-variant\/10:hover { background-color: rgba(225, 227, 225, 0.1) !important; }

        /* Typography */
        .text-headline-md {
          font-size: 24px !important;
          line-height: 32px !important;
          font-weight: 600 !important;
        }
        .text-headline-lg {
          font-size: 32px !important;
          line-height: 40px !important;
          letter-spacing: -0.01em !important;
          font-weight: 600 !important;
        }
        .text-display-lg {
          font-size: 48px !important;
          line-height: 56px !important;
          letter-spacing: -0.02em !important;
          font-weight: 700 !important;
        }
        .text-body-lg {
          font-size: 18px !important;
          line-height: 28px !important;
          font-weight: 400 !important;
        }
        .text-body-md {
          font-size: 16px !important;
          line-height: 24px !important;
          font-weight: 400 !important;
        }
        .text-label-md {
          font-size: 14px !important;
          line-height: 20px !important;
          letter-spacing: 0.01em !important;
          font-weight: 500 !important;
        }
        .text-label-sm {
          font-size: 12px !important;
          line-height: 16px !important;
          font-weight: 600 !important;
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      ` }} />

      <AuthNavbar pageType="login" />

      <main className="flex flex-1 flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Section: Brand & Visuals (Desktop) */}
        <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-xl h-full">
          {/* Abstract Tech Background Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(163, 246, 156, 0.15) 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
          </div>

          <div className="relative z-10 w-full max-w-lg text-on-primary">
            {/* Branding Header */}
            <div className="mb-12">
              <span className="inline-block px-3 py-1 bg-[#2e7d32] text-white rounded-full font-label-sm text-label-sm mb-4 uppercase tracking-wider">
                Enterprise Ready
              </span>
              <h1 className="font-display-lg text-display-lg text-white mb-4">InterviewOS</h1>
              <p className="font-body-lg text-body-lg text-primary-fixed opacity-95 max-w-md">
                Elevate your engineering standards with the world's most sophisticated technical assessment platform.
              </p>
            </div>

            {/* Code Snippet Card (Glassmorphism) */}
            <div className="glass-effect rounded-2xl p-md border border-outline-variant/20 shadow-2xl overflow-hidden text-on-surface-variant">
              <div className="flex items-center gap-base mb-md border-b border-outline-variant/10 pb-sm">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-2 font-mono text-[12px] opacity-60">technical_screen.js</span>
              </div>
              <pre className="font-mono text-label-md leading-relaxed text-[#40493d]">
                <span className="text-[#0d631b] font-bold">async function</span> <span className="text-[#2a6b2c]">evaluateCandidate</span>(session) &#123;{"\n"}
                {"  "}<span className="text-[#0d631b] font-bold">const</span> report = <span className="text-[#0d631b] font-bold">await</span> OS.analyze(&#123;{"\n"}
                {"    "}performance: session.metrics,{"\n"}
                {"    "}logic: session.codeOutput,{"\n"}
                {"    "}communication: session.audio{"\n"}
                {"  "}&#125;);{"\n\n"}
                {"  "}<span className="text-[#0d631b] font-bold">return</span> report.getSignal();{"\n"}
                &#125;{"\n\n"}
                <span className="opacity-40">// Deployment Ready</span>{"\n"}
                <span className="text-[#2a6b2c]">OS.deploy</span>(<span className="text-[#1d622b] font-semibold">'elite-talent'</span>);
              </pre>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-primary object-cover" alt="Engineer 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc6SLhtyqq8a-9HbYlbdhZernbGjq3YDfpMPJwde8_gjUod76lXgjY4fA5af3aKNreTWB9SzYk48YJMGywX_B7oHjJllvIh9aOG2jaNqygSOtTqwWpt8Rk18o8wmAzs2Er2cUZoXpvhy-Vner3y_FRv4Moat1UleTInZ8I3VrrJdweeuzxfOaETTiypAj8CQnG3a8eUQPOPVV_NEIj16G_vUKL-V5ZJpHFfE89Mqokx-ZBsM2YAfEe-RHQPVa50CYuy1_7p5EqBqo" />
                <img className="w-10 h-10 rounded-full border-2 border-primary object-cover" alt="Engineer 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg9_LmnPheinFWus4_J5OAuCLM6kus-Ez1XJWdtod3O9t25vjPtCs5rMzaG0cQ6EffCWZZld8EeTStW1dpmiG4WEfisWIdvgLKr30OdZzRvJVkpym54PiBH99Ybc3VPnGcEJGdzZIe7dX_XYKogOsJjki4uNM3SpqVHhCnCUg3vKZjBvFIAueyrzFPZc2J7-cFGZOBtsfibsvU0eXgrVQXu1mbJqIpowjnGvRylhGNvBrFeGOPGBySEUD6W0b2cpLHI_34FpizEz4" />
                <img className="w-10 h-10 rounded-full border-2 border-primary object-cover" alt="Engineer 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNkMVtyZ7VkKapj8T6gdTkI-BmZw5rqx5oiumUvd2Rv6uR0FqghdrPdB29XTreK4rAZ2u7BGsgd3tX67k27E-qVGKmwl3UUdW-rD1DaZKtVImdDRjChYLrLeAJJVOQOn72kOrTWn51TauQf38hStZKKS9sBweiXHHLnAv1tOSkliycIKrh9Vd-rnGzyuAN6jCwJtx9jD8iGH59XhThCtXaLNvFDRiUdpNeAD55jcql8u4Ia3Hv5xEzgcIlbokZz1bWJsAUL6J9B-c" />
              </div>
              <p className="font-label-md text-label-md text-primary-fixed opacity-85">
                Trusted by <span className="text-white font-bold">500+</span> elite engineering teams globally.
              </p>
            </div>
          </div>
        </section>

        {/* Right Section: Onboarding Form */}
        <section className="w-full lg:w-1/2 flex flex-col items-center bg-surface p-margin-mobile md:p-margin-desktop min-h-0 relative justify-center py-8 overflow-y-auto h-full">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#e8f5e9]/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0d631b]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-full max-w-[480px] my-auto relative z-10">
            {/* Header */}
            <header className="mb-md">

              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Welcome back</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Enter your credentials to access your dashboard.</p>
            </header>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <div className="flex flex-col">
                <label className="font-label-md text-label-md text-on-surface-variant mb-1.5" htmlFor="email">Work Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    {...register("email")}
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-md py-sm rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all outline-none font-body-md text-body-md text-on-surface"
                  />
                </div>
                {errors.email && touchedFields.email && (
                  <p className="text-xs text-error font-medium mt-1" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="font-label-md text-label-md text-primary hover:underline transition-all">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-sm rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all outline-none font-body-md text-body-md text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-on-surface-variant/60 hover:text-on-surface transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && touchedFields.password && (
                  <p className="text-xs text-error font-medium mt-1" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Server Error */}
              {serverError && (
                <p className="text-xs text-error font-medium" role="alert">
                  {serverError}
                </p>
              )}

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-sm py-1">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-outline text-primary focus:ring-primary h-4 w-4"
                />
                <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">
                  Remember this device
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-md bg-[#0d631b] hover:bg-[#094713] disabled:opacity-50 text-white rounded-xl font-headline-md text-headline-md shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <div className="relative flex justify-center text-label-sm">
                <span className="bg-surface px-sm text-on-surface-variant uppercase tracking-wider">OR CONTINUE WITH</span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleGoogle()}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-sm py-sm border border-outline-variant/30 rounded-xl bg-white hover:bg-[#f2f4f2] transition-all font-label-md text-label-md text-on-surface font-semibold shadow-sm hover:shadow active:scale-[0.99]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={handleGithub}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-sm py-sm border border-outline-variant/30 rounded-xl bg-white hover:bg-[#f2f4f2] transition-all font-label-md text-label-md text-on-surface font-semibold shadow-sm hover:shadow active:scale-[0.99]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"></path>
                </svg>
                GitHub
              </button>
            </div>

            <footer className="mt-8 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Don't have an account?{" "}
                <Link to="/register" className="text-[#0d631b] font-bold hover:underline">
                  Sign up
                </Link>
              </p>
            </footer>
          </div>

          {/* System Status Indicator */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1 opacity-40">
            <div className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">InterviewOS Core v4.2 Online</span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
