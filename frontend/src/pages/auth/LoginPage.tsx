import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroBg from '@/assets/hero-bg.jpg';
import logo from '@/assets/Logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, mockInterviewer, mockCandidate } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
// google icon will be rendered inline SVG since lucide-react lacks one

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // simulate login
    await new Promise((r) => setTimeout(r, 800));
    const user = email.includes('alex') ? mockInterviewer : mockCandidate;
    login(user);
    toast({ title: `Welcome back, ${user.name}!` });
    navigate(user.role === 'interviewer' ? '/dashboard/interviewer' : '/dashboard/candidate');
    setIsLoading(false);
  };

  const handleGoogle = () => {
    // stubbed google login flow
    const user = mockCandidate;
    login(user);
    toast({ title: `Signed in with Google as ${user.name}` });
    navigate('/dashboard/candidate');
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* background image with blur + darken overlay */}
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover filter blur-sm brightness-75"
      />
      <div className="absolute inset-0 bg-black/40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md p-8 space-y-6 bg-secondary/90 backdrop-blur-md rounded-lg shadow-lg"
      >
        <div className="flex justify-center mb-1">
          <a href="/">
            <img src={logo} alt="InterviewOS Logo" className="h-28 object-contain" />
          </a>
        </div>
        <h2 className="text-2xl font-display font-bold text-center">Welcome 👋 Let's get started!</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5 bg-secondary border-border"
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 h-11" disabled={isLoading}>
            {isLoading ? 'Please wait...' : 'Continue'}
          </Button>
        </form>

        <div className="flex items-center justify-center">
          <div className="h-px bg-border flex-1" />
          <span className="mx-2 text-xs text-muted-foreground">or</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700 focus:text-gray-700 active:text-gray-700"
          onClick={handleGoogle}
        >
          {/* google G logo */}
          <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
            <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.3H272v95.1h146.9c-6.3 34-25 62.8-53.3 82v68h86.1c50.2-46.3 80-114.3 80-194.8z"/>
            <path fill="#34A853" d="M272 544.3c72.6 0 133.7-24 178.3-65.4l-86.1-68c-24 16.1-54.8 25.5-92.2 25.5-70.9 0-131-47.9-152.5-112.1h-89.8v70.5c44.8 88.5 137.2 149.5 242.3 149.5z"/>
            <path fill="#FBBC05" d="M119.5 322.8c-10.4-31-10.4-64.5 0-95.5v-70.5h-89.8c-39.5 78.9-39.5 170.6 0 249.5l89.8-70.5z"/>
            <path fill="#EA4335" d="M272 107.7c39.5 0 75 13.6 103 40.1l77.4-77.4C397.9 24.2 339 0 272 0 166.9 0 74.5 61 29.7 149.5l89.8 70.5C141 155.6 201.1 107.7 272 107.7z"/>
          </svg>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link to="/" className="text-primary hover:underline">
            Skip &amp; continue to Home
          </Link>
        </p>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
