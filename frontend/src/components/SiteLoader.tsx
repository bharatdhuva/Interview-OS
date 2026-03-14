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
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/30 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Loading page"
        >
          <motion.div
            initial={{ scale: 0.95, y: 4, opacity: 0.8 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 4, opacity: 0 }}
            className="flex items-center gap-3 rounded-full border border-border/70 bg-card/90 px-4 py-2.5 shadow-card"
          >
            <div className="relative h-5 w-5">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
              />
            </div>
            <p className="text-xs font-medium tracking-[0.08em] text-foreground/90">Loading...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}