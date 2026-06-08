import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

/* ─── Password strength ─── */
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
    3: { label: "Good", color: "#6366f1" },
    4: { label: "Strong", color: "#2a6b2c" },
  };
  const clamped = Math.max(1, Math.min(4, score));
  return { level: clamped, ...map[clamped] };
};

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { toast } = useToast();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      const loginWithGithub = async () => {
        setError("");
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
          login(user, d.accessToken);
          sessionStorage.setItem("justLoggedIn", "true");
          window.history.replaceState({}, document.title, window.location.pathname);
          if (d.isOnboarded === false) {
            navigate("/onboarding");
          } else {
            navigate(user.role === "interviewer" ? "/dashboard/interviewer" : "/dashboard/candidate");
          }
        } catch (err) {
          setError(err?.response?.data?.message || "GitHub authentication failed");
          window.history.replaceState({}, document.title, window.location.pathname);
        } finally {
          setLoading(false);
        }
      };
      loginWithGithub();
    }
  }, [login, navigate]);

  const handleGithub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || "your_github_client_id_here";
    const redirectUri = `${window.location.origin}/register`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setError("");
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
        login(user, d.accessToken);
        sessionStorage.setItem("justLoggedIn", "true");
        if (d.isOnboarded === false) {
          navigate("/onboarding");
        } else {
          navigate(user.role === "interviewer" ? "/dashboard/interviewer" : "/dashboard/candidate");
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Google authentication failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google sign-in failed. Please try again."),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) return;

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Please enter your full name");
      return;
    }
    if (!email.trim() || !isEmailValid) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password needs min 8 chars, 1 letter, 1 number");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: fullName.trim(),
        email: email.trim(),
        password,
        role,
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

      login(user, d.accessToken);

      toast({
        title: "Welcome to InterviewOS!",
        description: "Your account has been created successfully.",
      });

      if (d.isOnboarded === false) {
        navigate("/onboarding");
      } else {
        navigate(user.role === "interviewer" ? "/dashboard/interviewer" : "/dashboard/candidate");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container min-h-screen w-full flex flex-col justify-center">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
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
          --primary: #00490e;
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

        .signup-container {
          font-family: 'Montserrat', sans-serif;
          background-color: var(--background);
          color: var(--on-surface);
        }

        .active-role {
          background-color: #acf4a4 !important;
          border-color: #0d631b !important;
          color: #191c1b !important;
        }

        .active-role span {
          color: #191c1b !important;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
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

      <main className="flex min-h-screen">
        {/* Left Section: Visual & Branding */}
        <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-xl lg:sticky lg:top-0 lg:h-screen">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              alt="Code Editor" 
              className="w-full h-full object-cover opacity-30 mix-blend-luminosity" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS2U0qNSA6eaxJ74rwxtrjghHxoQ63lvGakn49Tw0ouYJWreDz2_8t09oHWpq-V1LJqsa74URKtRBGOeh7JgmnWh9yknMjMwG0t552eIvlPIC2Ea0TS0ue1JKym0WJnqu5hGjX9iQWyhg5ZdJS6e2cis50AQq8rcMCHiVxlrEfEl8rhkH0cDmN0zjmLmA6O8JQvRyj1jYKzcJPX-g0zLIrZRLBtcSKQTIdGD17mpVpeoeRMlIhN_hrIGW1Q-Z5gkCa4kREJd2Y_z0"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-transparent"></div>
          </div>
          {/* Content */}
          <div className="relative z-10 max-w-lg text-on-primary">
            <div className="mb-12">
              <span className="font-headline-md text-headline-md font-bold">InterviewOS</span>
            </div>
            <h1 className="font-display-lg text-display-lg mb-6 leading-tight">
              Elevate your technical assessment.
            </h1>
            <p className="font-body-lg text-body-lg text-primary-fixed opacity-90 mb-12">
              The precision engineering platform for elite technical hiring. Join 500+ engineering teams scaling with confidence.
            </p>
            {/* Trust Markers */}
            <div className="grid grid-cols-2 gap-8 border-t border-on-primary-fixed-variant pt-8">
              <div>
                <div className="font-headline-md text-headline-md mb-2">98%</div>
                <p className="font-label-md text-label-md text-primary-fixed opacity-70">Interview Success Rate</p>
              </div>
              <div>
                <div className="font-headline-md text-headline-md mb-2">15k+</div>
                <p className="font-label-md text-label-md text-primary-fixed opacity-70">Assessments Monthly</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: Onboarding Form */}
        <section className="w-full lg:w-1/2 flex flex-col items-center bg-surface p-margin-mobile md:p-margin-desktop min-h-screen">
          <div className="w-full max-w-[480px] my-auto">
            {/* Header */}
            <header className="mb-md">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Create your account</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Start building your high-performance engineering team today.</p>
            </header>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="flex flex-col">
                <label className="font-label-md text-label-md text-on-surface-variant mb-1.5" htmlFor="full-name">Full Name</label>
                <input 
                  id="full-name" 
                  type="text"
                  placeholder="Alex Rivera" 
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  autoComplete="name"
                  className="w-full px-md py-sm rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all outline-none text-on-surface" 
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col">
                <label className="font-label-md text-label-md text-on-surface-variant mb-1.5" htmlFor="email">Work Email</label>
                <input 
                  id="email" 
                  type="email"
                  placeholder="alex@company.com" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  autoComplete="email"
                  className="w-full px-md py-sm rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all outline-none text-on-surface" 
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
                  <span className="font-label-sm text-label-sm text-on-surface-variant" id="strength-label">
                    Strength: {strength.label || "-"}
                  </span>
                </div>
                <input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  autoComplete="new-password"
                  className="w-full px-md py-sm rounded-xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all outline-none text-on-surface" 
                />
                {/* Strength Meter Container - layout-stable */}
                <div className="flex gap-xs mt-1.5 h-1 w-full rounded-full bg-surface-container overflow-hidden">
                  <div 
                    id="strength-bar"
                    className="h-full transition-all duration-300"
                    style={{
                      width: password.length > 0 ? `${(strength.level / 4) * 100}%` : "0%",
                      backgroundColor: password.length > 0 ? (strength.color || "#bfcaba") : "transparent"
                    }}
                  />
                </div>
              </div>

              {/* TOS Checkbox */}
              <div className="flex items-center gap-sm py-1">
                <input 
                  id="tos" 
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (error) setError("");
                  }}
                  required
                  className="rounded border-outline text-primary focus:ring-primary h-4 w-4" 
                />
                <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="tos">
                  I agree to the <a className="text-secondary font-medium hover:underline" href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a className="text-secondary font-medium hover:underline" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                </label>
              </div>

              {/* Error Alert */}
              {error && (
                <p className="text-xs text-error font-medium" role="alert">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={!termsAccepted || loading}
                className="w-full py-md bg-[#0d631b] hover:bg-[#094713] disabled:opacity-50 text-white rounded-xl font-headline-md text-headline-md shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
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
                Already have an account?{" "}
                <Link to="/login" className="text-[#0d631b] font-bold hover:underline">
                  Login
                </Link>
              </p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage;
