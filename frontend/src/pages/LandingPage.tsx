import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Users,
  Video,
  Clock3,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/Logo.png";
import msuLogo from "@/assets/Partner-Logos/msu.png";
import ldceLogo from "@/assets/Partner-Logos/ldce.png";
import parulLogo from "@/assets/Partner-Logos/ParulU.png";
import gtuLogo from "@/assets/Partner-Logos/GTU.png";
import mastercardLogo from "@/assets/Partner-Logos/Mastercard.png";
import infosysLogo from "@/assets/Partner-Logos/Infosys.png";
import matrixLogo from "@/assets/Partner-Logos/Matrix.png";
import oracleLogo from "@/assets/Partner-Logos/Oracle.png";

const partnerLogos = [
  { src: msuLogo, alt: "MSU Baroda" },
  { src: ldceLogo, alt: "LDCE" },
  { src: parulLogo, alt: "Parul University" },
  { src: gtuLogo, alt: "GTU" },
  { src: mastercardLogo, alt: "Mastercard" },
  { src: infosysLogo, alt: "Infosys" },
  { src: matrixLogo, alt: "Matrix" },
  { src: oracleLogo, alt: "Oracle" },
];

const features = [
  {
    icon: Code2,
    title: "Collaborative code workspace",
    text: "Interviewer and candidate code in the same editor with zero context switching.",
  },
  {
    icon: Video,
    title: "Built-in live interview room",
    text: "Run voice and video interviews with screen sharing directly inside the platform.",
  },
  {
    icon: LayoutDashboard,
    title: "Evaluation dashboard",
    text: "Scorecards, notes, and hiring signals in one place after every session.",
  },
  {
    icon: MessageSquare,
    title: "Real-time communication",
    text: "In-room chat and prompts for structured interviews and clearer candidate flow.",
  },
  {
    icon: Shield,
    title: "Secure by default",
    text: "Role-based room access and protected session data for teams and institutions.",
  },
  {
    icon: BarChart3,
    title: "Hiring analytics",
    text: "Track interview quality, pass rates, and cycle time without manual spreadsheets.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    cta: "Get Started",
    highlights: ["Up to 5 interviews/month", "Core interview room", "Basic scorecards"],
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    cta: "Start Team Trial",
    highlights: ["Unlimited interviews", "Panel interviews", "Advanced analytics"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    cta: "Contact Sales",
    highlights: ["SSO + audit logs", "Priority support", "Custom workflows"],
  },
];

function ProductPreview() {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_30px_70px_-45px_rgba(15,23,42,0.55)]">
      <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#0ea5e9]" />
        </div>
        <span className="text-xs font-medium text-slate-600">Interview Room</span>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Shared Editor</p>
          <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-200">
{`function longestSubstring(input) {
  const seen = new Map();
  let left = 0;
  let best = 0;

  for (let right = 0; right < input.length; right++) {
    if (seen.has(input[right])) {
      left = Math.max(left, seen.get(input[right]) + 1);
    }
    seen.set(input[right], right);
    best = Math.max(best, right - left + 1);
  }

  return best;
}`}
          </pre>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Session</p>
            <div className="space-y-2 text-sm text-slate-700">
              <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#0ea5e9]" /> 42 min live</p>
              <p className="flex items-center gap-2"><Users className="h-4 w-4 text-[#14b8a6]" /> 2 interviewers</p>
              <p className="flex items-center gap-2"><Video className="h-4 w-4 text-[#f97316]" /> HD connected</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Score Snapshot</p>
            <div className="space-y-3">
              {["Problem Solving", "Communication", "Code Quality"].map((metric, index) => (
                <div key={metric}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span>{metric}</span>
                    <span>{88 + index * 3}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${88 + index * 3}%` }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.7, delay: index * 0.1 }}
                      className="h-2 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#14b8a6]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#0ea5e9]/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#14b8a6]/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="InterviewOS" className="h-9 w-auto" />
            <span className="text-sm font-semibold tracking-wide text-slate-700">InterviewOS</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition-colors hover:text-slate-900">Features</a>
            <a href="#workflow" className="transition-colors hover:text-slate-900">Workflow</a>
            <a href="#pricing" className="transition-colors hover:text-slate-900">Pricing</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
              <Link to="/register">Start Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container py-14 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-4 inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                Interview Infrastructure for Modern Teams
              </p>
              <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Run fast,
                <span className="bg-gradient-to-r from-[#0ea5e9] to-[#14b8a6] bg-clip-text text-transparent"> structured interviews </span>
                without tool switching.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                InterviewOS gives hiring teams one product for coding interviews, video calls, candidate evaluation, and reporting.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-11 rounded-lg bg-slate-900 px-6 text-white hover:bg-slate-800">
                  <Link to="/register" className="group">
                    Create Workspace
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 rounded-lg border-slate-300 bg-white px-6">
                  <Link to="/login">View Live Demo</Link>
                </Button>
              </div>

              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                {[
                  { value: "99.9%", label: "Uptime" },
                  { value: "<120ms", label: "Sync Latency" },
                  { value: "10k+", label: "Interviews" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                    <div className="text-lg font-bold text-slate-900">{item.value}</div>
                    <div className="text-xs text-slate-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ProductPreview />
            </motion.div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-8">
          <div className="container">
            <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Trusted by teams and institutions
            </p>
            <div className="grid grid-cols-2 items-center gap-6 opacity-75 sm:grid-cols-4 md:grid-cols-8">
              {partnerLogos.map((partner) => (
                <img
                  key={partner.alt}
                  src={partner.src}
                  alt={partner.alt}
                  className="mx-auto h-8 w-auto object-contain grayscale transition hover:grayscale-0"
                />
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="container py-16 md:py-20">
          <div className="mb-8 max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything needed for technical interviews</h2>
            <p className="mt-3 text-slate-600">
              Productized interview workflows, not disconnected tools stitched together.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="mb-4 inline-flex rounded-xl bg-slate-900 p-2.5 text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="workflow" className="bg-white py-16 md:py-20">
          <div className="container grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. Create",
                text: "Set up role-based interview templates and share room links in minutes.",
              },
              {
                title: "2. Conduct",
                text: "Run live coding sessions with video, chat, prompts, and interviewer notes.",
              },
              {
                title: "3. Decide",
                text: "Use structured scorecards and reports to shorten your hiring decisions.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 p-6">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="container py-16 md:py-20">
          <div className="mb-8 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Simple pricing, scalable teams</h2>
              <p className="mt-2 text-slate-600">Start free, then scale when your hiring volume grows.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 ${
                  plan.featured
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-900"
                }`}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-3 text-3xl font-bold">
                  {plan.price}
                  <span className={`text-sm font-medium ${plan.featured ? "text-slate-300" : "text-slate-500"}`}>
                    {plan.period}
                  </span>
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {plan.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${plan.featured ? "text-[#22c55e]" : "text-[#0ea5e9]"}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-6 w-full ${
                    plan.featured
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 py-16 text-white md:py-20">
          <div className="container flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Build a repeatable interview process</h2>
              <p className="mt-3 max-w-xl text-slate-300">
                Replace fragmented interview tooling with one SaaS platform your team can run every day.
              </p>
            </div>
            <Button asChild size="lg" className="bg-[#14b8a6] text-slate-950 hover:bg-[#0d9488]">
              <Link to="/register">Start for Free</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}