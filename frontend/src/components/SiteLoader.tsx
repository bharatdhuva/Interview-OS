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
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] overflow-hidden bg-slate-950"
          aria-live="polite"
          aria-label="Loading"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_80%_65%,rgba(168,85,247,0.18),transparent_35%)]" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-3"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-violet-500/30" />
              <p className="text-xl font-semibold tracking-[0.18em] text-slate-100">
                INTERVIEWOS
              </p>
            </motion.div>

            <div className="w-52 max-w-[80vw] overflow-hidden rounded-full border border-slate-700/70 bg-slate-900/80 p-[2px]">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
                className="h-1.5 w-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
              />
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              Preparing your workspace
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}