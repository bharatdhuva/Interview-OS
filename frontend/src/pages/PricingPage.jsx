import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, Sparkles, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    subtitle: 'Perfect for practice and getting started',
    cta: 'Current Plan',
    disabled: true,
    features: ['1 active interview room', 'Basic code editor', 'Feedback summary', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    subtitle: 'For serious candidates and individual interviewers',
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO || 'price_pro',
    cta: 'Upgrade to Pro',
    highlighted: true,
    features: [
      'Unlimited interview rooms',
      'Advanced proctoring',
      'Session replay',
      'Priority support',
      'Detailed analytics',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    price: '$79',
    subtitle: 'For hiring teams and organizations',
    priceId: import.meta.env.VITE_STRIPE_PRICE_TEAM || 'price_team',
    cta: 'Choose Team',
    features: ['Everything in Pro', 'Organization workspaces', 'Team seat management', 'Central billing', 'SLA support'],
  },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheckout = async (plan) => {
    if (!plan.priceId) return;

    setError('');
    setLoadingPlan(plan.id);

    try {
      const response = await api.post('/billing/checkout', { priceId: plan.priceId });
      const checkoutUrl = response?.data?.data?.url;

      if (!checkoutUrl) {
        throw new Error('Checkout URL not returned from server');
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        navigate('/login');
        return;
      }

      const message = err?.response?.data?.message || 'Unable to start checkout right now. Please try again.';
      setError(message);
    } finally {
      setLoadingPlan('');
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
            <Button onClick={() => navigate('/register')}>Create Account</Button>
          </div>
        </div>
      </header>

      <main className="container py-10 sm:py-14">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Straightforward pricing
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight mb-3">Pick The Plan That Matches Your Interview Velocity</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Start free and upgrade when you need more room capacity, replay tooling, and collaboration controls.
          </p>
        </motion.div>

        {error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm">
            {error}
          </motion.div>
        ) : null}

        <section className="grid lg:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className={[
                'rounded-2xl border p-6 flex flex-col',
                plan.highlighted
                  ? 'border-primary/50 bg-gradient-to-b from-primary/10 to-card shadow-[0_10px_40px_rgba(99,102,241,0.2)]'
                  : 'border-border bg-card',
              ].join(' ')}
            >
              <div className="mb-5">
                <h2 className="text-xl font-display font-bold">{plan.name}</h2>
                <p className="text-3xl font-display font-bold mt-2">{plan.price}
                  {plan.id !== 'free' ? <span className="text-sm font-normal text-muted-foreground">/month</span> : null}
                </p>
                <p className="text-sm text-muted-foreground mt-2">{plan.subtitle}</p>
              </div>

              <ul className="space-y-2.5 text-sm mb-7 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                disabled={plan.disabled || loadingPlan === plan.id}
                onClick={() => handleCheckout(plan)}
                className={plan.highlighted ? 'bg-gradient-primary hover:opacity-90' : ''}
                variant={plan.highlighted ? 'default' : 'secondary'}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    {plan.cta}
                    {!plan.disabled ? <ArrowRight className="w-4 h-4 ml-2" /> : null}
                  </>
                )}
              </Button>
            </motion.article>
          ))}
        </section>
      </main>
    </div>
  );
}
