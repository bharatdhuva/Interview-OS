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
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

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
    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      const { user, accessToken } = response.data.data;
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
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const response = await api.post("/auth/google", {
          token: tokenResponse.access_token,
          role, // Pass the selected role for new signups
        });
        const { user, accessToken } = response.data.data;
        login(user, accessToken);
        toast({ title: `Welcome to InterviewOS, ${user.name}!` });
        navigate(
          user.role === "interviewer"
            ? "/dashboard/interviewer"
            : "/dashboard/candidate",
        );
      } catch (error: any) {
        toast({
          title: "Google Signup Failed",
          description: error.response?.data?.message || "Authentication failed",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast({ title: "Google Signup Failed", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background */}
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
        {/* Top colored bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="p-5 space-y-1">
          {/* Logo — small and clean */}
          <div className="flex justify-center">
            <a href="/">
              <img
                src={isDark ? logo : logoLight}
                alt="InterviewOS"
                className="h-16 w-auto object-contain"
              />
            </a>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h2 className="text-2xl font-bold">Create your account 🚀</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Join InterviewOS today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your Name "
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1.5 bg-secondary border-border"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 bg-secondary border-border"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-secondary border-border pr-10"
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

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 h-11"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Google */}
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

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
