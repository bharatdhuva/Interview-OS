import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const POPUP_STORAGE_KEY = "interviewos:home-welcome:last-shown-at";
const SHOW_EVERY_HOURS = 24;

function shouldShowPopup() {
  const lastShown = localStorage.getItem(POPUP_STORAGE_KEY);
  if (!lastShown) return true;

  const lastShownAt = Number(lastShown);
  if (!Number.isFinite(lastShownAt)) return true;

  const elapsedMs = Date.now() - lastShownAt;
  return elapsedMs >= SHOW_EVERY_HOURS * 60 * 60 * 1000;
}

export default function HomeWelcomePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (shouldShowPopup()) {
      setOpen(true);
      localStorage.setItem(POPUP_STORAGE_KEY, String(Date.now()));
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg border-slate-200 bg-white/95 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close welcome popup"
          className="absolute right-4 top-4 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="space-y-3 text-left">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-800"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Welcome To InterviewOS
          </motion.div>

          <DialogTitle className="font-serif text-2xl text-slate-900 sm:text-3xl">
            One platform for fair, focused interviews.
          </DialogTitle>

          <DialogDescription className="text-sm leading-relaxed text-slate-600">
            Start faster with live coding, video, and interviewer notes in a single workspace built for modern hiring teams.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Role-based interview rooms</div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Real-time code execution</div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Structured final feedback</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
            <Link to="/register" onClick={() => setOpen(false)}>
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login" onClick={() => setOpen(false)}>Log In</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}