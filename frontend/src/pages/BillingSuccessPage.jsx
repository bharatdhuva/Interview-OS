import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight, CreditCard, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function BillingSuccessPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState('pro');
  const [status, setStatus] = useState('active');
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const sessionId = searchParams.get('session_id');
  const dashboardPath = user?.role === 'candidate' ? '/dashboard/candidate' : '/dashboard/interviewer';

  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/billing/subscription');
        const subscription = response?.data?.data;
        if (subscription?.plan) {
          setPlan(subscription.plan);
        }
        if (subscription?.status) {
          setStatus(subscription.status);
        }
      } catch (err) {
        const statusCode = err?.response?.status;
        if (statusCode === 401) {
          navigate('/login');
          return;
        }
        setError('Payment succeeded, but we could not fetch subscription details yet. Please refresh in a few seconds.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [navigate]);

  const handleOpenPortal = async () => {
    try {
      const response = await api.post('/billing/portal');
      const portalUrl = response?.data?.data?.url;
      if (portalUrl) {
        window.location.href = portalUrl;
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to open billing portal right now.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary">
              <Terminal className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">InterviewOS</span>
          </Link>
          <Button variant="ghost" onClick={() => navigate('/pricing')}>Pricing</Button>
        </div>
      </header>

      <main className="container py-12 sm:py-20">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto rounded-2xl border border-primary/30 bg-card p-8 sm:p-10"
        >
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>

          <h1 className="text-3xl font-display font-bold mb-2">Subscription Activated</h1>
          <p className="text-muted-foreground mb-6">
            {user?.name ? `Nice, ${user.name}.` : 'Nice work.'} Your payment completed successfully and your account is now upgraded.
          </p>

          <div className="rounded-xl border border-border p-4 sm:p-5 bg-background/50 space-y-2 mb-6">
            <p className="text-sm text-muted-foreground">Checkout Session</p>
            <p className="text-sm font-mono break-all">{sessionId || 'Not provided'}</p>
            {loading ? (
              <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing subscription details...
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-lg font-semibold capitalize">{plan}</p>
                <p className="text-sm text-muted-foreground">Status: <span className="capitalize text-foreground">{status}</span></p>
              </>
            )}
          </div>

          {error ? <p className="text-sm text-warning mb-6">{error}</p> : null}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => navigate(dashboardPath)} className="bg-gradient-primary hover:opacity-90">
              Go To Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="secondary" onClick={handleOpenPortal}>
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Billing
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
