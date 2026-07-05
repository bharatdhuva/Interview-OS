import React from "react";
import { motion } from "framer-motion";
import { Code2, Video, Shield } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";
const features = [
    {
        icon: Code2,
        title: "Live Code Editor",
        desc: "Monaco-powered with Y.js real-time sync",
    },
    {
        icon: Video,
        title: "WebRTC Video Calling",
        desc: "P2P HD video, zero plugins needed",
    },
    {
        icon: Shield,
        title: "Proctoring System",
        desc: "Fullscreen lock + 3-strike anti-cheat",
    },
];
const avatarGradients = [
    "linear-gradient(135deg, #0d631b, #88d982)",
    "linear-gradient(135deg, #88d982, #a3f69c)",
    "linear-gradient(135deg, #a3f69c, #0d631b)",
    "linear-gradient(135deg, #f59e0b, #ef4444)",
    "linear-gradient(135deg, #10b981, #06b6d4)",
];
const avatarInitials = ["AK", "SM", "JP", "LW", "RD"];
const AuthLayout = ({ children, variant }) => {
    return (<div className="flex min-h-screen overflow-hidden" style={{ background: "#08080f" }}>
      {/* Left Panel */}
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="hidden lg:flex w-[42%] relative overflow-hidden flex-col" style={{
            background: "linear-gradient(160deg, #0c0c18 0%, #0f0e1f 40%, #0c0b18 100%)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
        }}>
        {/* Orb 1 */}
        <div className="absolute" style={{
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            background: "radial-gradient(circle, rgba(13,99,27,0.18), transparent 70%)",
            borderRadius: "50%",
            animation: "floatOrb1 9s ease-in-out infinite",
        }}/>
        {/* Orb 2 */}
        <div className="absolute" style={{
            bottom: -60,
            left: -60,
            width: 260,
            height: 260,
            background: "radial-gradient(circle, rgba(163,246,156,0.12), transparent 70%)",
            borderRadius: "50%",
            animation: "floatOrb2 12s ease-in-out infinite",
        }}/>
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
        }}/>
        {/* Top specular line */}
        <div className="absolute top-0 left-0 right-0" style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(136,217,130,0.4), transparent)",
        }}/>

        {/* Animated SVG background */}
        <AnimatedBackground />

        {/* Logo */}
        <div className="absolute top-8 left-10 z-10 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0d631b, #2e7d32)" }}>
            <Code2 size={16} color="white"/>
          </div>
          <span className="text-[15px] font-bold tracking-tight" style={{ color: "#ededf0" }}>
            InterviewOS
          </span>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center px-10 lg:px-12 relative z-10">
          <div className="flex flex-col gap-8">
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <span className="ios-eyebrow">
                ⚡ Built for serious engineers
              </span>
            </motion.div>

            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <h1 className="text-[2rem] font-bold leading-[1.2]" style={{ letterSpacing: "-0.03em" }}>
                <span style={{ color: "#ededf0" }}>
                  {variant === "login"
            ? "Your Gateway to"
            : "Join the Future of"}
                </span>
                <br />
                <span className="ios-gradient-text">
                  {variant === "login"
            ? "Ace Every Interview"
            : "Technical Interviews"}
                </span>
              </h1>
            </motion.div>

            <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="text-sm leading-relaxed" style={{ color: "#888899" }}>
              Real-time collaboration
              <br />
              and HD video — all in one platform.
            </motion.p>

            <div className="flex flex-col gap-4">
              {features.map((f, i) => (<motion.div key={f.title} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 + i * 0.08 }} className="flex items-start gap-3">
                  <div className="ios-feature-icon">
                    <f.icon size={16}/>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold" style={{ color: "#ededf0" }}>
                      {f.title}
                    </div>
                    <div className="text-xs mt-px" style={{ color: "#666677" }}>
                      {f.desc}
                    </div>
                  </div>
                </motion.div>))}
            </div>
          </div>
        </div>

        {/* Bottom social proof */}
        <div className="relative z-10 px-10 lg:px-12 pb-8" style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 24,
        }}>
          <div className="flex items-center gap-3">
            <div className="flex">
              {avatarInitials.map((initials, i) => (<div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white" style={{
                background: avatarGradients[i],
                marginLeft: i > 0 ? -8 : 0,
                border: "2px solid #08080f",
                zIndex: 5 - i,
                position: "relative",
            }}>
                  {initials}
                </div>))}
            </div>
            <span className="text-xs" style={{ color: "#666677" }}>
              Trusted by 10,000+ developers
            </span>
          </div>
        </div>
      </motion.div>

      {/* Right Panel */}
      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }} className="flex-1 flex items-center justify-center overflow-y-auto relative" style={{
            background: "linear-gradient(145deg, #0a0a12 0%, #0d0d1a 50%, #080810 100%)",
            minHeight: '100vh',
            overflowX: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
        {/* Subtle green glow */}
        <div className="absolute top-0 right-0 pointer-events-none" style={{
            width: 400,
            height: 400,
            background: "rgba(13,99,27,0.06)",
            filter: "blur(100px)",
            borderRadius: "50%",
            transform: "translate(20%, -20%)",
        }}/>

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
        }}/>

        <div className="w-full max-w-[520px] lg:max-w-[440px] px-5 sm:px-6 py-8 sm:py-10 lg:py-0 relative z-10" style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
              background: "linear-gradient(135deg, #0d631b, #2e7d32)",
            }}>
              <Code2 size={16} color="white"/>
            </div>
            <span className="text-[15px] font-bold tracking-tight" style={{ color: "#ededf0" }}>
              InterviewOS
            </span>
          </div>
          {children}
        </div>
      </motion.div>
    </div>);
};
export default AuthLayout;
