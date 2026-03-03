import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import React, { useRef, useState, useCallback, useMemo } from "react";

interface AnimatedCTAButtonProps {
  to: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/* ─── tiny spark particles ─── */
interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
}

const SPARK_COLORS = [
  "rgba(139,92,246,.9)",
  "rgba(99,102,241,.85)",
  "rgba(59,130,246,.8)",
  "rgba(236,72,153,.7)",
  "rgba(255,255,255,.9)",
];

let particleId = 0;

export default function AnimatedCTAButton({
  to,
  children,
  variant = "primary",
  size = "md",
  icon,
  trailingIcon,
  className = "",
  fullWidth = false,
}: AnimatedCTAButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  /* ── magnetic tilt values ── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 250, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 250, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  /* spark burst on click */
  const spawnParticles = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const batch: Particle[] = Array.from({ length: 14 }, () => ({
      id: particleId++,
      x: cx,
      y: cy,
      angle: Math.random() * 360,
      distance: 30 + Math.random() * 60,
      size: 2 + Math.random() * 4,
      color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
    }));
    setParticles((prev) => [...prev, ...batch]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !batch.includes(p)));
    }, 700);
  }, []);

  const sizes = useMemo(
    () => ({
      sm: "h-10 px-6 text-sm gap-2",
      md: "h-12 px-8 text-base gap-2.5",
      lg: "h-14 px-10 text-lg gap-3",
    }),
    [],
  );

  const baseClasses =
    "relative rounded-full font-semibold inline-flex items-center justify-center cursor-pointer select-none transition-[border-color] duration-300";

  const variantClasses: Record<string, string> = {
    primary: "overflow-hidden",
    outline:
      "border border-primary/20 text-foreground bg-background/50 backdrop-blur-sm overflow-hidden",
    secondary:
      "bg-white/[.08] backdrop-blur-md text-white border border-white/[.12] overflow-hidden",
  };

  return (
    <motion.div
      className={`${fullWidth ? "w-full" : "inline-block"} perspective-[800px]`}
      style={{ perspective: 800 }}
      whileHover="hover"
      whileTap="tap"
      initial="idle"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Link
          ref={ref}
          to={to}
          onClick={spawnParticles}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`${baseClasses} ${sizes[size]} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
          style={{ isolation: "isolate" }}
        >
          {/* ═══════ PRIMARY ═══════ */}
          {variant === "primary" && (
            <>
              {/* living gradient that morphs on hover */}
              <motion.div
                className="absolute inset-0 rounded-full"
                variants={{
                  idle: {
                    background:
                      "linear-gradient(135deg, hsl(239,84%,67%) 0%, hsl(263,84%,58%) 50%, hsl(280,87%,65%) 100%)",
                  },
                  hover: {
                    background: [
                      "linear-gradient(135deg, hsl(239,84%,67%) 0%, hsl(263,84%,58%) 50%, hsl(280,87%,65%) 100%)",
                      "linear-gradient(225deg, hsl(189,95%,50%) 0%, hsl(263,84%,58%) 50%, hsl(330,80%,60%) 100%)",
                      "linear-gradient(315deg, hsl(280,87%,65%) 0%, hsl(239,84%,67%) 50%, hsl(189,95%,50%) 100%)",
                      "linear-gradient(135deg, hsl(239,84%,67%) 0%, hsl(263,84%,58%) 50%, hsl(280,87%,65%) 100%)",
                    ],
                    transition: { duration: 4, repeat: Infinity, ease: "linear" },
                  },
                }}
              />

              {/* Dual-layer shimmer (faster + slower) */}
              <motion.div
                className="absolute inset-0 rounded-full mix-blend-overlay"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.35) 37%, rgba(255,255,255,0.55) 40%, rgba(255,255,255,0.35) 43%, transparent 55%)",
                  backgroundSize: "300% 100%",
                }}
                variants={{
                  idle: { backgroundPosition: "150% 0" },
                  hover: {
                    backgroundPosition: ["-100% 0", "250% 0"],
                    transition: { duration: 1.6, repeat: Infinity, repeatDelay: 0.8, ease: [0.4, 0, 0.2, 1] },
                  },
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full mix-blend-soft-light"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.15) 48%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 52%, transparent 65%)",
                  backgroundSize: "400% 100%",
                }}
                variants={{
                  idle: { backgroundPosition: "200% 0" },
                  hover: {
                    backgroundPosition: ["-50% 0", "300% 0"],
                    transition: { duration: 2.4, repeat: Infinity, repeatDelay: 0.2, ease: "linear" },
                  },
                }}
              />

              {/* Soft inner light at top */}
              <div className="absolute inset-x-0 top-0 h-[45%] rounded-t-full bg-gradient-to-b from-white/[.12] to-transparent pointer-events-none" />

              {/* Glow + lift */}
              <motion.div
                className="absolute inset-0 rounded-full"
                variants={{
                  idle: {
                    boxShadow:
                      "0 4px 20px -4px rgba(99,102,241,.3), inset 0 1px 0 rgba(255,255,255,.15)",
                  },
                  hover: {
                    boxShadow:
                      "0 10px 40px -6px rgba(99,102,241,.5), 0 0 60px -10px rgba(139,92,246,.35), inset 0 1px 0 rgba(255,255,255,.2)",
                  },
                  tap: {
                    boxShadow:
                      "0 2px 8px -2px rgba(99,102,241,.35), inset 0 1px 0 rgba(255,255,255,.1)",
                  },
                }}
                transition={{ duration: 0.35 }}
              />

              {/* Spinning conic border */}
              <motion.div
                className="absolute inset-[-1.5px] rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, hsl(239,84%,67%,0), hsl(280,87%,65%), hsl(189,95%,50%), hsl(330,80%,60%), hsl(239,84%,67%,0))",
                }}
                variants={{
                  idle: { opacity: 0, rotate: 0 },
                  hover: {
                    opacity: 0.7,
                    rotate: 360,
                    transition: {
                      opacity: { duration: 0.4 },
                      rotate: { duration: 3.5, repeat: Infinity, ease: "linear" },
                    },
                  },
                }}
              />
              <motion.div
                className="absolute inset-[0.5px] rounded-full"
                variants={{
                  idle: { opacity: 0 },
                  hover: { opacity: 1 },
                }}
                style={{
                  background:
                    "linear-gradient(135deg, hsl(239,84%,67%) 0%, hsl(263,84%,58%) 50%, hsl(280,87%,65%) 100%)",
                }}
                transition={{ duration: 0.3 }}
              />
            </>
          )}

          {/* ═══════ OUTLINE ═══════ */}
          {variant === "outline" && (
            <>
              {/* Animated gradient border on hover */}
              <motion.div
                className="absolute inset-[-1px] rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, hsl(239,84%,67%,.4), hsl(280,87%,65%,.5), hsl(189,95%,50%,.4), hsl(239,84%,67%,.4))",
                }}
                variants={{
                  idle: { opacity: 0, rotate: 0 },
                  hover: {
                    opacity: 1,
                    rotate: 360,
                    transition: {
                      opacity: { duration: 0.3 },
                      rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    },
                  },
                }}
              />
              <div className="absolute inset-[1px] rounded-full bg-background/90 backdrop-blur-sm" />

              {/* Subtle fill on hover */}
              <motion.div
                className="absolute inset-[1px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, hsl(239,84%,67%,.06), transparent 70%)",
                }}
                variants={{
                  idle: { scale: 0.4, opacity: 0 },
                  hover: { scale: 1.2, opacity: 1 },
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />

              {/* Glow */}
              <motion.div
              className="absolute inset-0 rounded-full"
                variants={{
                  idle: { boxShadow: "0 0 0 0 rgba(99,102,241,0)" },
                  hover: { boxShadow: "0 0 25px -8px rgba(99,102,241,.25)" },
                }}
                transition={{ duration: 0.3 }}
              />
            </>
          )}

          {/* ═══════ SECONDARY ═══════ */}
          {variant === "secondary" && (
            <>
              {/* Glass highlight */}
              <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/[.08] to-transparent pointer-events-none" />

              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 30%, rgba(255,255,255,.12) 48%, rgba(255,255,255,.22) 50%, rgba(255,255,255,.12) 52%, transparent 70%)",
                  backgroundSize: "250% 100%",
                }}
                variants={{
                  idle: { backgroundPosition: "150% 0" },
                  hover: {
                    backgroundPosition: ["-80% 0", "200% 0"],
                    transition: { duration: 1.8, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" },
                  },
                }}
              />

              {/* Glow */}
              <motion.div
              className="absolute inset-0 rounded-full"
                variants={{
                  idle: { boxShadow: "0 0 0 0 rgba(255,255,255,0)" },
                  hover: {
                    boxShadow:
                      "0 6px 30px -6px rgba(255,255,255,.15), inset 0 1px 0 rgba(255,255,255,.15)",
                  },
                }}
                transition={{ duration: 0.35 }}
              />
            </>
          )}

          {/* ─── Spark particles (all variants) ─── */}
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full pointer-events-none z-30"
              style={{
                width: p.size,
                height: p.size,
                left: p.x,
                top: p.y,
                background: p.color,
                boxShadow: `0 0 ${p.size + 2}px ${p.color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.55 + Math.random() * 0.25, ease: "easeOut" }}
            />
          ))}

          {/* ─── Content with micro-lift ─── */}
          <motion.span
            className={`relative z-10 flex items-center tracking-wide ${
              variant === "primary" ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,.2)]" : ""
            }`}
            style={{ gap: "inherit" }}
            variants={{
              idle: { y: 0 },
              hover: { y: -1 },
              tap: { y: 1, scale: 0.97 },
            }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            {icon && (
              <motion.span
                className="flex items-center"
                variants={{
                  idle: { rotate: 0, scale: 1 },
                  hover: {
                    rotate: [0, -12, 14, -8, 6, 0],
                    scale: [1, 1.15, 1.15, 1.1, 1.05, 1.1],
                    transition: {
                      duration: 0.7,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 1.5,
                    },
                  },
                }}
              >
                {icon}
              </motion.span>
            )}

            <span>{children}</span>

            {trailingIcon && (
              <motion.span
                className="flex items-center"
                variants={{
                  idle: { x: 0 },
                  hover: {
                    x: [0, 5, 0],
                    transition: {
                      duration: 0.9,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.2, 1],
                    },
                  },
                }}
              >
                {trailingIcon}
              </motion.span>
            )}
          </motion.span>
        </Link>
      </motion.div>
    </motion.div>
  );
}
