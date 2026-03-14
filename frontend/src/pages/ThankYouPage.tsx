import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, CalendarCheck2, FileCheck2, Home, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThankYouPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roomId = searchParams.get("roomId");
  const stage = searchParams.get("stage") || "interview";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="absolute right-0 top-48 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <Terminal className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold tracking-wide">InterviewOS</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg shadow-slate-200/70 sm:p-10"
        >
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <h1 className="font-serif text-3xl text-slate-900 sm:text-4xl">Thank You</h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              {stage === "feedback"
                ? "Your feedback was submitted successfully. We appreciate the structured evaluation."
                : "Your interview session has ended successfully. Thank you for your time and effort."}
            </p>

            {roomId && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                Session ID: {roomId}
              </p>
            )}
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 text-cyan-800">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">What Happens Next</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Your session details are now available in InterviewOS for follow-up, review, and hiring decisions.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <CalendarCheck2 className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-slate-900">Stay Prepared</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Keep your dashboard up to date to track upcoming sessions and feedback updates in one place.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => navigate(-1)} variant="outline">
              <Home className="mr-2 h-4 w-4" /> Go Back
            </Button>
            <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
              <Link to="/dashboard/candidate">
                Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
