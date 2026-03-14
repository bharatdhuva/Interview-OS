import { motion, AnimatePresence } from "framer-motion";

interface SiteLoaderProps {
  visible: boolean;
}

export default function SiteLoader({ visible }: SiteLoaderProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] overflow-hidden bg-slate-950"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Loading page"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_80%_65%,rgba(168,85,247,0.18),transparent_35%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.9),rgba(2,6,23,0.98))]" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="mb-6 inline-flex items-center gap-3"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-violet-500/30" />
              <p className="text-xl font-semibold tracking-[0.18em] text-slate-100">
                INTERVIEWOS
              </p>
            </motion.div>

            <div className="relative w-[min(760px,92vw)] overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-2xl shadow-black/30 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-3 w-36 rounded-full bg-slate-700/70" />
                <div className="h-3 w-16 rounded-full bg-slate-700/60" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="h-28 rounded-xl bg-slate-800/85" />
                <div className="h-28 rounded-xl bg-slate-800/80" />
                <div className="h-28 rounded-xl bg-slate-800/75" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-2.5 w-full rounded-full bg-slate-800/90" />
                <div className="h-2.5 w-4/5 rounded-full bg-slate-800/75" />
              </div>

              <motion.div
                initial={{ x: "-120%" }}
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
                className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
            </div>

            <div className="w-52 max-w-[80vw] overflow-hidden rounded-full border border-slate-700/70 bg-slate-900/80 p-[2px]">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.05, ease: "easeInOut", repeat: Infinity }}
                className="h-1.5 w-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
              />
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              Loading Interview Workspace
            </p>

            <p className="mt-1 text-[11px] text-slate-500">Securing room context, syncing UI, and preparing collaboration tools.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}