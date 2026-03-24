import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
export default function ThemeToggle({ isDark, onToggle, size = "md", }) {
    const sizes = {
        sm: { track: "w-14 h-7", knob: "w-5 h-5", icon: "w-3 h-3", translate: 28, starSize: 1.5 },
        md: { track: "w-16 h-8", knob: "w-6 h-6", icon: "w-3.5 h-3.5", translate: 32, starSize: 2 },
        lg: { track: "w-20 h-10", knob: "w-8 h-8", icon: "w-4.5 h-4.5", translate: 40, starSize: 2.5 },
    };
    const s = sizes[size];
    const stars = [
        { x: 3, y: 2, delay: 0 },
        { x: 7, y: 5, delay: 0.1 },
        { x: 5, y: 8, delay: 0.05 },
        { x: 10, y: 3, delay: 0.15 },
        { x: 12, y: 7, delay: 0.08 },
    ];
    return (<button onClick={onToggle} className={`relative ${s.track} rounded-full cursor-pointer overflow-hidden border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`} aria-label="Toggle dark mode">
      {/* Track background with animated gradient */}
      <motion.div className="absolute inset-0 rounded-full" animate={{
            background: isDark
                ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
                : "linear-gradient(135deg, #38bdf8 0%, #7dd3fc 50%, #bae6fd 100%)",
        }} transition={{ duration: 0.5, ease: "easeInOut" }}/>

      {/* Clouds (light mode) */}
      <AnimatePresence>
        {!isDark && (<>
            <motion.div className="absolute rounded-full bg-white/60" style={{ width: 10, height: 5, top: "20%", left: "55%" }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.4, delay: 0.1 }}/>
            <motion.div className="absolute rounded-full bg-white/40" style={{ width: 8, height: 4, bottom: "25%", left: "60%" }} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.4, delay: 0.2 }}/>
            <motion.div className="absolute rounded-full bg-white/50" style={{ width: 12, height: 5, top: "50%", left: "50%" }} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.4, delay: 0.15 }}/>
          </>)}
      </AnimatePresence>

      {/* Stars (dark mode) */}
      <AnimatePresence>
        {isDark &&
            stars.map((star, i) => (<motion.div key={i} className="absolute rounded-full bg-white" style={{
                    width: s.starSize,
                    height: s.starSize,
                    right: `${star.x}px`,
                    top: `${star.y}px`,
                }} initial={{ opacity: 0, scale: 0 }} animate={{
                    opacity: [0, 1, 0.6, 1],
                    scale: 1,
                }} exit={{ opacity: 0, scale: 0 }} transition={{
                    duration: 0.4,
                    delay: star.delay,
                    opacity: {
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: star.delay,
                    },
                }}/>))}
      </AnimatePresence>

      {/* Crater marks on moon (dark mode) */}
      <AnimatePresence>
        {isDark && (<motion.div className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none z-20" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }} transition={{ delay: 0.3 }}>
            <div className="absolute rounded-full bg-gray-400" style={{ width: 3, height: 3, left: 10, top: -2 }}/>
            <div className="absolute rounded-full bg-gray-400" style={{ width: 2, height: 2, left: 14, top: 3 }}/>
          </motion.div>)}
      </AnimatePresence>

      {/* Knob */}
      <motion.div className={`absolute top-1 ${s.knob} rounded-full shadow-lg flex items-center justify-center z-10`} animate={{
            left: isDark ? 4 : s.translate,
            backgroundColor: isDark ? "#f1f5f9" : "#fbbf24",
            boxShadow: isDark
                ? "0 0 8px rgba(241, 245, 249, 0.3), 0 2px 8px rgba(0,0,0,0.3)"
                : "0 0 12px rgba(251, 191, 36, 0.5), 0 2px 8px rgba(0,0,0,0.15)",
        }} transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.8,
        }}>
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (<motion.div key="moon" initial={{ rotate: -90, scale: 0, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: 90, scale: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <Moon className={`${s.icon} text-slate-700`}/>
            </motion.div>) : (<motion.div key="sun" initial={{ rotate: 90, scale: 0, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: -90, scale: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <Sun className={`${s.icon} text-amber-700`}/>
            </motion.div>)}
        </AnimatePresence>
      </motion.div>

      {/* Glow ring on hover */}
      <motion.div className="absolute inset-0 rounded-full" whileHover={{
            boxShadow: isDark
                ? "inset 0 0 12px rgba(148, 163, 184, 0.15)"
                : "inset 0 0 12px rgba(56, 189, 248, 0.2)",
        }} transition={{ duration: 0.2 }}/>
    </button>);
}
