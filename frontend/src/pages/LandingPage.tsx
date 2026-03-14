import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Menu,
  MessageSquare,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Video,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import logo from "@/assets/Logo.png";
import heroInterview from "@/assets/hero-interview.png";
import msuLogo from "@/assets/Partner-Logos/msu.png";
import ldceLogo from "@/assets/Partner-Logos/ldce.png";
import parulLogo from "@/assets/Partner-Logos/ParulU.png";
import gtuLogo from "@/assets/Partner-Logos/GTU.png";
import mastercardLogo from "@/assets/Partner-Logos/Mastercard.png";
import infosysLogo from "@/assets/Partner-Logos/Infosys.png";
import matrixLogo from "@/assets/Partner-Logos/Matrix.png";
import oracleLogo from "@/assets/Partner-Logos/Oracle.png";
import accentureLogo from "@/assets/Partner-Logos/Accenture.png";

const partnerLogos = [
  { src: msuLogo, alt: "MSU Baroda" },
  { src: ldceLogo, alt: "LDCE" },
  { src: parulLogo, alt: "Parul University" },
  { src: gtuLogo, alt: "GTU" },
  { src: mastercardLogo, alt: "Mastercard" },
  { src: infosysLogo, alt: "Infosys" },
  { src: matrixLogo, alt: "Matrix" },
  { src: oracleLogo, alt: "Oracle" },
  { src: accentureLogo, alt: "Accenture" },
];

const features = [
  {
    icon: Code2,
    title: "Live Coding Workspace",
    description:
      "Collaborative Monaco editor with real-time presence, multi-language support, and zero context-switching.",
  },
  {
    icon: Video,
    title: "WebRTC Interview Calls",
    description:
      "Built-in HD video and screen sharing keep interviews fluid without plugins or separate meeting tools.",
  },
  {
    icon: MessageSquare,
    title: "Contextual Chat",
    description:
      "Share links, snippets, and clarifications in-room without interrupting candidate focus.",
  },
  {
    icon: Sparkles,
    title: "AI Coaching Layer",
    description:
      "Intelligent hints and post-interview summaries help teams evaluate fairly and quickly.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description:
      "Room-based access, role-aware controls, and audit-friendly workflows for hiring teams.",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    description:
      "Run code in-browser, test edge cases live, and review runtime behavior during the session.",
  },
];

const faqs = [
  {
    question: "Do candidates need to install anything?",
    answer:
      "No. InterviewOS runs in-browser with editor, video, and chat in one room. Candidates join via a single link.",
  },
  {
    question: "Can we run both technical and behavioral rounds?",
    answer:
      "Yes. Teams use the same platform for coding, architecture discussions, and conversational assessments.",
  },
  {
    question: "How does AI assistance work during interviews?",
    answer:
      "It provides configurable hints and generates structured post-round notes. Interviewers remain fully in control.",
  },
  {
    question: "Is InterviewOS suitable for panels?",
    answer:
      "Yes. Multiple interviewers can join the same room and collaborate on feedback in real time.",
  },
];

const testimonials = [
  {
    quote:
      "We cut interview coordination overhead by half in two weeks. The shared coding context is a game changer.",
    name: "Anita Rao",
    role: "Engineering Manager, Product Org",
  },
  {
    quote:
      "Candidates feel calmer because everything is in one place. Completion rates and feedback quality both improved.",
    name: "Rohan Mehta",
    role: "Talent Lead, ScaleUp Team",
  },
  {
    quote:
      "The platform made remote panel interviews feel intentional instead of chaotic.",
    name: "Shreya Patel",
    role: "Senior Recruiter, Enterprise Hiring",
  },
];

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full bg-cyan-200/60 blur-3xl" />
        <div className="absolute right-0 top-48 h-96 w-96 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="InterviewOS" className="h-8 w-auto" />
            <span className="text-sm font-semibold tracking-[0.18em] text-slate-700">
              INTERVIEWOS
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-900">Features</a>
            <a href="#workflow" className="transition hover:text-slate-900">Workflow</a>
            <a href="#testimonials" className="transition hover:text-slate-900">Stories</a>
            <a href="#faq" className="transition hover:text-slate-900">FAQ</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="icon" onClick={() => setIsDark((v) => !v)}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
              <Link to="/register">Start Free</Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)}>Workflow</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Stories</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button className="w-full bg-slate-900 text-white hover:bg-slate-800" asChild>
                <Link to="/register">Start Free</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-10 pt-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800">
              <Sparkles className="h-3.5 w-3.5" />
              Interview Room Reimagined
            </p>
            <h1 className="mt-6 max-w-xl font-serif text-4xl leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Run Better Interviews Without Tool Hopping
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              InterviewOS unifies live coding, video, chat, and feedback into one focused workspace so your team can evaluate candidates with speed and consistency.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800" asChild>
                <Link to="/register" className="inline-flex items-center gap-2">
                  Launch InterviewOS
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Open Dashboard</Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-slate-700 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                <p className="text-xl font-semibold text-slate-900">7+</p>
                <p>Languages</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                <p className="text-xl font-semibold text-slate-900">&lt;100ms</p>
                <p>Sync Latency</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                <p className="text-xl font-semibold text-slate-900">P2P</p>
                <p>Video Core</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                <p className="text-xl font-semibold text-slate-900">AI</p>
                <p>Feedback Layer</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-8 h-24 w-24 rounded-2xl bg-cyan-300/40 blur-2xl" />
            <div className="absolute -bottom-8 right-2 h-24 w-24 rounded-2xl bg-amber-300/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-300/40">
              <img
                src={heroInterview}
                alt="Interview session interface"
                className="h-auto w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200/70 bg-white/80 py-8">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              Trusted by teams and institutions
            </p>
            <div className="mt-6 grid grid-cols-3 items-center gap-6 sm:grid-cols-5 lg:grid-cols-9">
              {partnerLogos.map((partner) => (
                <img
                  key={partner.alt}
                  src={partner.src}
                  alt={partner.alt}
                  className="mx-auto h-7 w-auto opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
                />
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">Platform Features</p>
            <h2 className="mt-3 font-serif text-3xl text-slate-900 sm:text-4xl">
              Everything Your Interview Loop Needs
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="workflow" className="bg-slate-900 py-16 text-slate-100 lg:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300">Workflow</p>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl sm:text-4xl">From Invite to Decision in Three Steps</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
                <p className="text-sm font-semibold text-cyan-300">01</p>
                <h3 className="mt-2 text-xl font-semibold">Create Room</h3>
                <p className="mt-2 text-sm text-slate-300">Spin up a role-based room and share a secure one-click invite.</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
                <p className="text-sm font-semibold text-cyan-300">02</p>
                <h3 className="mt-2 text-xl font-semibold">Interview Live</h3>
                <p className="mt-2 text-sm text-slate-300">Code, discuss, and run test cases in one synchronized environment.</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6">
                <p className="text-sm font-semibold text-cyan-300">03</p>
                <h3 className="mt-2 text-xl font-semibold">Capture Signals</h3>
                <p className="mt-2 text-sm text-slate-300">Finalize structured feedback with AI-assisted summaries for faster decisions.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">Social Proof</p>
              <h2 className="mt-3 font-serif text-3xl text-slate-900 sm:text-4xl">Loved by Hiring Teams</h2>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-4 inline-flex">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="text-sm leading-relaxed text-slate-700">"{testimonial.quote}"</p>
                <p className="mt-6 text-sm font-semibold text-slate-900">{testimonial.name}</p>
                <p className="text-xs text-slate-500">{testimonial.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="bg-white/85 py-16 lg:py-20">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">FAQ</p>
            <h2 className="mt-3 text-center font-serif text-3xl text-slate-900 sm:text-4xl">
              Questions Teams Ask Before Switching
            </h2>

            <Accordion type="single" collapsible className="mt-10 rounded-2xl border border-slate-200 bg-white px-6">
              {faqs.map((item, idx) => (
                <AccordionItem key={item.question} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-left text-sm font-semibold text-slate-900">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-slate-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 px-6 py-10 text-white sm:px-10 lg:flex lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300">Start Today</p>
              <h3 className="mt-3 font-serif text-2xl leading-tight sm:text-3xl">
                Ship a cleaner interview experience this week
              </h3>
              <p className="mt-3 text-sm text-slate-200">
                Move your next technical round to InterviewOS and keep every signal in one place.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-0 lg:justify-end">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" asChild>
                <Link to="/register">Create Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10" asChild>
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
