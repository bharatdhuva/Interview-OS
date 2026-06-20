import React from "react";
import { motion } from "framer-motion";
const AnimatedBackground = () => {
    return (<div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating geometric grid */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(13,99,27,0.15)"/>
            <stop offset="100%" stopColor="rgba(163,246,156,0.05)"/>
          </linearGradient>
          <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(13,99,27,0.3)"/>
            <stop offset="50%" stopColor="rgba(163,246,156,0.2)"/>
            <stop offset="100%" stopColor="rgba(136,217,130,0.15)"/>
          </linearGradient>
        </defs>

        {/* Circuit-like horizontal lines */}
        <motion.line x1="0" y1="25%" x2="60%" y2="25%" stroke="url(#line-grad)" strokeWidth="1" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}/>
        <motion.line x1="40%" y1="45%" x2="100%" y2="45%" stroke="url(#line-grad)" strokeWidth="1" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2.2, delay: 0.8, ease: "easeInOut" }}/>
        <motion.line x1="10%" y1="70%" x2="75%" y2="70%" stroke="url(#line-grad)" strokeWidth="1" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.8, delay: 1.1, ease: "easeInOut" }}/>

        {/* Vertical connectors */}
        <motion.line x1="60%" y1="25%" x2="60%" y2="45%" stroke="url(#line-grad)" strokeWidth="1" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.2, delay: 2.5 }}/>
        <motion.line x1="40%" y1="45%" x2="40%" y2="70%" stroke="url(#line-grad)" strokeWidth="1" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.2, delay: 3 }}/>
      </svg>

      {/* Pulsing node dots at intersections */}
      <motion.div className="absolute rounded-full" style={{
            left: "60%",
            top: "25%",
            width: 6,
            height: 6,
            background: "rgba(13,99,27,0.5)",
            boxShadow: "0 0 12px rgba(13,99,27,0.4)",
        }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.7] }} transition={{
            duration: 0.6,
            delay: 2.5,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 3,
        }}/>
      <motion.div className="absolute rounded-full" style={{
            left: "40%",
            top: "45%",
            width: 6,
            height: 6,
            background: "rgba(163,246,156,0.5)",
            boxShadow: "0 0 12px rgba(163,246,156,0.4)",
        }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.7] }} transition={{
            duration: 0.6,
            delay: 3,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 4,
        }}/>
      <motion.div className="absolute rounded-full" style={{
            left: "75%",
            top: "70%",
            width: 5,
            height: 5,
            background: "rgba(136,217,130,0.5)",
            boxShadow: "0 0 10px rgba(136,217,130,0.3)",
        }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.6] }} transition={{
            duration: 0.6,
            delay: 2.9,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 5,
        }}/>

      {/* Orbiting ring */}
      <svg className="absolute" style={{ top: "15%", right: "10%", width: 120, height: 120 }}>
        <motion.circle cx="60" cy="60" r="50" fill="none" stroke="rgba(13,99,27,0.1)" strokeWidth="1" strokeDasharray="8 12" initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "60px 60px" }}/>
        <motion.circle cx="60" cy="60" r="35" fill="none" stroke="rgba(163,246,156,0.08)" strokeWidth="1" strokeDasharray="5 10" initial={{ rotate: 0 }} animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "60px 60px" }}/>
      </svg>

      {/* Hexagon grid fragment */}
      <svg className="absolute" style={{
            bottom: "20%",
            left: "5%",
            width: 160,
            height: 140,
            opacity: 0.4,
        }}>
        <motion.path d="M40 10 L70 10 L85 36 L70 62 L40 62 L25 36 Z" fill="none" stroke="rgba(13,99,27,0.12)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1.5 }}/>
        <motion.path d="M70 62 L100 62 L115 88 L100 114 L70 114 L55 88 Z" fill="none" stroke="rgba(163,246,156,0.1)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 2 }}/>
        <motion.path d="M10 62 L40 62 L55 88 L40 114 L10 114 L-5 88 Z" fill="none" stroke="rgba(136,217,130,0.08)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 2.5 }}/>
      </svg>

      {/* Floating data stream */}
      <svg className="absolute" style={{ top: "55%", right: "5%", width: 80, height: 200 }}>
        {[0, 1, 2, 3, 4].map((i) => (<motion.rect key={i} x="30" y={i * 40} width={20 - i * 2} height="2" rx="1" fill={`rgba(13,99,27,${0.2 - i * 0.03})`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: [0, 0.6, 0], x: [0, 10, 20] }} transition={{
                duration: 2,
                delay: 1.5 + i * 0.3,
                repeat: Infinity,
                repeatDelay: 2,
            }}/>))}
      </svg>
    </div>);
};
export default AnimatedBackground;
