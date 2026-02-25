import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/Logo.png";
const logoLight = "/logo-light.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"candidate" | "interviewer">("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{
    field?: string;
    message: string;
  } | null>(null);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailOk = emailPattern.test(email);
    setEmailValid(isEmailOk);
    // Password validation (min 8 chars, at least 1 number, 1 letter)
    const isPasswordOk = password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
    setPasswordValid(isPasswordOk);
    if (!isEmailOk || !isPasswordOk) {
      setError({ message: !isEmailOk ? "Please enter a valid email address." : "Password must be at least 8 characters and contain a letter and a number." });
      return;
    }
    if (!acceptedTerms) {
      setError({ message: "You must accept the Terms & Privacy Policy to continue." });
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      const data = response.data.data;
      const user = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar || "",
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };
      const accessToken = data.accessToken;
      login(user, accessToken);
      toast({
        title: "Account created!",
        description: "Welcome to InterviewOS.",
      });
      navigate(
        user.role === "interviewer"
          ? "/dashboard/interviewer"
          : "/dashboard/candidate",
      );
    } catch (err: any) {
      const msg = err.response?.data?.message || "Something went wrong";
      if (
        msg.toLowerCase().includes("email") ||
        msg.toLowerCase().includes("exists")
      ) {
        setError({ field: "email", message: msg });
      } else if (msg.toLowerCase().includes("password")) {
        setError({ field: "password", message: msg });
      } else if (msg.toLowerCase().includes("name")) {
        setError({ field: "name", message: msg });
      } else {
        setError({ field: "password", message: msg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setError(null);
        setIsLoading(true);
        const response = await api.post("/auth/google", {
          token: tokenResponse.access_token,
          role,
        });
        const { user, accessToken } = response.data.data;
        login(user, accessToken);
        toast({ title: `Welcome to InterviewOS, ${user.name}!` });
        navigate(
          user.role === "interviewer"
            ? "/dashboard/interviewer"
            : "/dashboard/candidate",
        );
      } catch (err: any) {
        setError({
          message: err.response?.data?.message || "Authentication failed",
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError({ message: "Google Signup Failed" });
    },
  });

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <img
        src={heroBg}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover filter blur-sm ${isDark ? "brightness-75" : "brightness-100"}`}
      />
      <div
        className={`absolute inset-0 ${isDark ? "bg-black/40" : "bg-gradient-to-b from-white/70 via-white/85 to-white/95"}`}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md mx-4 bg-secondary/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="p-8 space-y-3">
          <div className="flex justify-center mb-0">
            <a href="/">
              <img
                src={isDark ? logo : logoLight}
                alt="InterviewOS"
                className="h-16 w-auto object-contain"
              />
            </a>
          </div>

          <div className="text-center mt-3">
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Join InterviewOS today
            </p>
          </div>

          {!error?.field && error?.message && (
            <p className="text-sm text-destructive text-center font-medium animate-in fade-in slide-in-from-top-1">
              {error.message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                required
                className={`mt-1.5 bg-secondary ${error?.field === "name" ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
              />
              {error?.field === "name" && (
                <p className="text-xs text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1">
                  {error.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                  // Email format validation
                  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  setEmailValid(emailPattern.test(e.target.value));
                }}
                className={`mt-1.5 bg-secondary ${!emailValid || error?.field === "email" ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
              />
              {!emailValid && (
                <p className="text-xs text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1">
                  Please enter a valid email address.
                </p>
              )}
              {error?.field === "email" && (
                <p className="text-xs text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1">
                  {error.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters, 1 letter, 1 number"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                    // Password strength
                    const val = e.target.value;
                    let strength = "";
                    if (val.length < 8) strength = "Too short";
                    else if (/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(val)) {
                      if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/.test(val)) strength = "Strong";
                      else if (/^(?=.*[a-zA-Z])(?=.*\d).{10,}$/.test(val)) strength = "Good";
                      else strength = "Fair";
                    } else strength = "Weak";
                    setPasswordStrength(strength);
                    setPasswordValid(val.length >= 8 && /[A-Za-z]/.test(val) && /[0-9]/.test(val));
                  }}
                  required
                  minLength={8}
                  className={`bg-secondary pr-10 ${!passwordValid || error?.field === "password" ? "border-destructive focus-visible:ring-destructive" : "border-border"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {password && (
                <div className="mt-1 text-xs">
                  <span className={`font-medium ${
                    passwordStrength === "Strong"
                      ? "text-green-600"
                      : passwordStrength === "Good"
                      ? "text-blue-600"
                      : passwordStrength === "Fair"
                      ? "text-yellow-600"
                      : passwordStrength === "Weak" || passwordStrength === "Too short"
                      ? "text-destructive"
                      : ""
                  }`}>
                    Password strength: {passwordStrength}
                  </span>
                </div>
              )}
              {!passwordValid && (
                <p className="text-xs text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1">
                  Password must be at least 8 characters and contain a letter and a number.
                </p>
              )}
              {error?.field === "password" && (
                <p className="text-xs text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1">
                  {error.message}
                </p>
              )}
            </div>

            <div>
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                {(["candidate", "interviewer"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      role === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={e => {
                  setAcceptedTerms(e.target.checked);
                  if (error) setError(null);
                }}
                className="accent-primary"
                required
              />
              <label htmlFor="terms" className="text-xs select-none">
                I agree to the
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline mx-1">Terms</a>
                &
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline mx-1">Privacy Policy</a>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 h-11 mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 bg-transparent border-border hover:bg-primary/10 hover:backdrop-blur-md hover:border-primary/50 transition-all duration-300"
            onClick={() => handleGoogle()}
          >
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
              <path
                fill="#4285F4"
                d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.3H272v95.1h146.9c-6.3 34-25 62.8-53.3 82v68h86.1c50.2-46.3 80-114.3 80-194.8z"
              />
              <path
                fill="#34A853"
                d="M272 544.3c72.6 0 133.7-24 178.3-65.4l-86.1-68c-24 16.1-54.8 25.5-92.2 25.5-70.9 0-131-47.9-152.5-112.1h-89.8v70.5c44.8 88.5 137.2 149.5 242.3 149.5z"
              />
              <path
                fill="#FBBC05"
                d="M119.5 322.8c-10.4-31-10.4-64.5 0-95.5v-70.5h-89.8c-39.5 78.9-39.5 170.6 0 249.5l89.8-70.5z"
              />
              <path
                fill="#EA4335"
                d="M272 107.7c39.5 0 75 13.6 103 40.1l77.4-77.4C397.9 24.2 339 0 272 0 166.9 0 74.5 61 29.7 149.5l89.8 70.5C141 155.6 201.1 107.7 272 107.7z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="mt-4">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
