import React, { useState, useMemo } from "react";
// ...existing code...
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, Loader2, User, } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/lib/api";
/* ─── Password strength ─── */
const getPasswordStrength = (pw) => {
    if (!pw)
        return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8)
        score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw))
        score++;
    if (/\d/.test(pw))
        score++;
    if (/[^a-zA-Z0-9]/.test(pw))
        score++;
    const map = {
        1: { label: "Weak", color: "#ef4444" },
        2: { label: "Fair", color: "#f97316" },
        3: { label: "Good", color: "#eab308" },
        4: { label: "Strong", color: "#22c55e" },
    };
    const clamped = Math.max(1, Math.min(4, score));
    return { level: clamped, ...map[clamped] };
};
const RegisterPage = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("candidate");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);
    const { toast } = useToast();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const strength = useMemo(() => getPasswordStrength(password), [password]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!termsAccepted)
            return;
        // Client-side validation
        if (!fullName.trim() || fullName.trim().length < 2) {
            setError("Please enter your full name");
            return;
        }
        if (!email.trim() || !isEmailValid) {
            setError("Please enter a valid email address");
            return;
        }
        if (password.length < 8 ||
            !/[A-Za-z]/.test(password) ||
            !/[0-9]/.test(password)) {
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
            
            // Log in directly
            login(user, d.accessToken);
            
            toast({
                title: "Welcome to InterviewOS!",
                description: "Your account has been created successfully.",
            });
            
            navigate(user.role === "interviewer"
                ? "/dashboard/interviewer"
                : "/dashboard/candidate");
        }
        catch (err) {
            const msg = err?.response?.data?.message || "Something went wrong";
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    };
    const handleGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setError("");
                setLoading(true);
                const res = await api.post("/auth/google", {
                    token: tokenResponse.access_token,
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
                toast({ title: `Welcome, ${user.name}!` });
                navigate(user.role === "interviewer"
                    ? "/dashboard/interviewer"
                    : "/dashboard/candidate");
            }
            catch (err) {
                setError(err?.response?.data?.message ||
                    "Google authentication failed");
            }
            finally {
                setLoading(false);
            }
        },
        onError: () => setError("Google signup failed. Please try again."),
    });
    const stagger = (i) => ({ delay: 0.15 + i * 0.06 });
    return (<AuthLayout variant="register">
      <form onSubmit={handleSubmit} className="flex flex-col" style={{ overflow: 'hidden', maxHeight: '100vh' }}>
        {/* Header */}
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(0)} className="text-center mb-7">
          <h1 className="text-[22px] font-bold" style={{ color: "#ededf0", letterSpacing: "-0.03em" }}>
            Create your account 🚀
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: "#888899" }}>
            Join 10,000+ developers &amp; interviewers
          </p>
        </motion.div>

        <div className="flex flex-col gap-3.5">
          {/* Full Name */}
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(1)}>
            <label htmlFor="reg-name" className="ios-label">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#444455" }}/>
              <input id="reg-name" type="text" className="ios-input" placeholder="Enter your full name" value={fullName} onChange={(e) => {
            setFullName(e.target.value);
            if (error)
                setError("");
        }} required autoComplete="name"/>
            </div>
          </motion.div>

          {/* Email */}
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(2)}>
            <label htmlFor="reg-email" className="ios-label">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#444455" }}/>
              <input id="reg-email" type="email" className="ios-input" placeholder="you@example.com" value={email} onChange={(e) => {
            setEmail(e.target.value);
            if (error)
                setError("");
        }} required autoComplete="email"/>
              {isEmailValid && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check size={16} style={{ color: "#22c55e" }}/>
                </motion.div>)}
            </div>
          </motion.div>

          {/* Password */}
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(3)}>
            <label htmlFor="reg-password" className="ios-label">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#444455" }}/>
              <input id="reg-password" type={showPassword ? "text" : "password"} className="ios-input !pr-10" placeholder="Password" value={password} onChange={(e) => {
            setPassword(e.target.value);
            if (error)
                setError("");
        }} required autoComplete="new-password"/>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer" style={{ color: "#444455" }} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {password.length > 0 && (<motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col mt-2">
                <div className="w-full h-[8px] rounded-xl bg-[#23233a] overflow-hidden shadow-sm">
                  <div className="h-full rounded-xl transition-all duration-300" style={{
                width: `${(strength.level / 4) * 100}%`,
                background: strength.level === 4
                    ? '#7c3aed' // Strong: purple
                    : strength.level === 3
                        ? '#6366f1' // Good: blue
                        : strength.level === 2
                            ? '#f59e42' // Fair: orange
                            : '#ef4444', // Weak: red
            }}/>
                </div>
                <span className="text-[12px] font-semibold mt-1 tracking-wide" style={{ color: strength.level === 4
                    ? '#a5b4fc'
                    : strength.level === 3
                        ? '#818cf8'
                        : strength.level === 2
                            ? '#fbbf24'
                            : '#f87171' }}>
                  {strength.label}
                </span>
              </motion.div>)}
          </motion.div>

          {/* Role toggle */}
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(4)}>
            <label className="ios-label">I Am A</label>
            <div className="flex gap-2">
              {["candidate", "interviewer"].map((r) => (<button key={r} type="button" onClick={() => setRole(r)} className="flex-1 h-10 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150" style={{
                background: role === r
                    ? "rgba(99,102,241,0.12)"
                    : "rgba(255,255,255,0.03)",
                border: `1px solid ${role === r ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.08)"}`,
                color: role === r ? "#a5b4fc" : "#888899",
            }}>
                  {r === "candidate" ? "👨‍💻 Candidate" : "🎯 Interviewer"}
                </button>))}
            </div>
          </motion.div>

          {/* Terms */}
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(5)} className="flex items-start gap-2">
            <input type="checkbox" id="terms" className="ios-checkbox mt-0.5" checked={termsAccepted} onChange={(e) => {
            setTermsAccepted(e.target.checked);
            if (error)
                setError("");
        }} required/>
            <label htmlFor="terms" className="text-xs cursor-pointer leading-relaxed" style={{ color: "#888899" }}>
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium" style={{ color: "#6366f1" }}>
                Terms
              </a>
              {" & "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium" style={{ color: "#6366f1" }}>
                Privacy Policy
              </a>
            </label>
          </motion.div>
        </div>

        {/* Error */}
        {error && (<motion.p initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] mt-3" style={{ color: "#f87171" }} role="alert">
            {error}
          </motion.p>)}

        {/* Submit */}
        <motion.button initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(6)} type="submit" className="ios-btn-primary mt-5" disabled={!termsAccepted || loading}>
          {loading ? (<>
              <Loader2 size={16} className="animate-spin"/>
              Creating account...
            </>) : (<>
              Create Account
              <ArrowRight size={16}/>
            </>)}
        </motion.button>

        {/* Divider */}
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(7)} className="ios-divider my-5">
          <span className="text-xs" style={{ color: "#444455" }}>
            or
          </span>
        </motion.div>

        {/* Google */}
        <motion.button initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(8)} type="button" className="ios-btn-social" onClick={() => handleGoogle()} disabled={loading}>
          <GoogleIcon size={20}/>
          Continue with Google
        </motion.button>

        {/* Footer */}
        <motion.p initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={stagger(9)} className="text-center text-[13px] mt-5" style={{ color: "#666677" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold transition-colors hover:brightness-125" style={{ color: "#6366f1" }}>
            Sign in
          </Link>
        </motion.p>
      </form>
    </AuthLayout>);
};
export default RegisterPage;
