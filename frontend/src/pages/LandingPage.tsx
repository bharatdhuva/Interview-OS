import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Code2,
  Video,
  MessageSquare,
  Brain,
  PenLine,
  Zap,
  ArrowRight,
  Users,
  Star,
  Mic,
  Monitor,
  PhoneOff,
  Home,
  Sparkles,
  HelpCircle,
  MicOff,
  VideoOff,
  MonitorOff,
  Phone,
  Rocket,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  Terminal,
  Shield,
  Play,
  CheckCircle2,
  Layout,
  Wifi,
  Send,
} from "lucide-react";
import { MotionWrapper } from "@/components/MotionWrapper";
import ThemeToggle from "@/components/ThemeToggle";
import AnimatedCTAButton from "@/components/AnimatedCTAButton";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroBg from "@/assets/hero-bg.jpg";
import heroInterview from "@/assets/hero-interview.png";
import logo from "@/assets/Logo.png";
import msuLogo from "@/assets/Partner-Logos/msu.png";
import ldceLogo from "@/assets/Partner-Logos/ldce.png";
import parulLogo from "@/assets/Partner-Logos/ParulU.png";
import gtuLogo from "@/assets/Partner-Logos/GTU.png";
import mastercardLogo from "@/assets/Partner-Logos/Mastercard.png";
import infosysLogo from "@/assets/Partner-Logos/Infosys.png";
import matrixLogo from "@/assets/Partner-Logos/Matrix.png";
import resilientTechLogo from "@/assets/Partner-Logos/Resillient Tech.png";
import oracleLogo from "@/assets/Partner-Logos/Oracle.png";
import accentureLogo from "@/assets/Partner-Logos/Accenture.png";
// CEO Photos
import ceoApple from "@/assets/CEO-Photos/apple.png";
import ceoBillGates from "@/assets/CEO-Photos/bill gates.png";
import ceoSamAltman from "@/assets/CEO-Photos/chatgpt.png";
import ceoSundar from "@/assets/CEO-Photos/google.jpg";
import ceoJensen from "@/assets/CEO-Photos/jensen.png";
import ceoMark from "@/assets/CEO-Photos/mark.png";
import ceoSatya from "@/assets/CEO-Photos/microsoft.png";
import ceoRahul from "@/assets/CEO-Photos/papu rahul gandhi.png";
import ceoModi from "@/assets/CEO-Photos/pmofindia.png";
import ceoPavel from "@/assets/CEO-Photos/telegramceo.png";
const logoLight = "/logo-light.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

// Partner logos array (move to top)
const partnerLogos = [
  { src: msuLogo, alt: "MSU Baroda" },
  { src: ldceLogo, alt: "LDCE" },
  { src: parulLogo, alt: "Parul University" },
  { src: gtuLogo, alt: "GTU" },
  { src: mastercardLogo, alt: "Mastercard" },
  { src: infosysLogo, alt: "Infosys" },
  { src: matrixLogo, alt: "Matrix" },
  { src: resilientTechLogo, alt: "Resilient Tech" },
  { src: oracleLogo, alt: "Oracle" },
  { src: accentureLogo, alt: "Accenture" },
];
const features = [
  {
    icon: Code2,
    badge: "CORE EDITOR",
    title: "Live Code Editor",
    headline: "Code together in real-time",
    description:
      "Our Monaco-powered collaborative editor brings the power of VS Code right into the browser. Both interviewer and candidate see real-time cursor positions, selections, and edits — with zero lag. Support for 7+ languages including Python, JavaScript, TypeScript, Java, C++, Go, and Rust.",
    highlights: ["Real-time cursor tracking", "7+ language support", "Syntax highlighting & IntelliSense", "Collaborative editing"],
    previewType: "editor" as const,
  },
  {
    icon: Video,
    badge: "COMMUNICATION",
    title: "WebRTC Video",
    headline: "Face-to-face, crystal clear",
    description:
      "Peer-to-peer HD video calling means your interviews feel natural and personal. Built-in screen sharing lets candidates walk through their code visually, while connection quality monitoring ensures you never miss a moment. No plugins, no downloads — it just works.",
    highlights: ["HD peer-to-peer video", "Screen sharing", "Connection quality monitoring", "No plugins required"],
    previewType: "video" as const,
  },
  {
    icon: Brain,
    badge: "AI POWERED",
    title: "AI Assistant",
    headline: "Smart hints when you need them",
    description:
      "Powered by GPT-4o, our AI assistant provides contextual hints during interviews, performs automated code reviews, and generates comprehensive post-interview analysis. It understands the problem context and provides progressive hints — from gentle nudges to detailed explanations.",
    highlights: ["Contextual hints", "Automated code review", "Post-interview analysis", "Progressive difficulty"],
    previewType: "ai" as const,
  },
  {
    icon: MessageSquare,
    badge: "COLLABORATION",
    title: "In-Room Chat",
    headline: "Communicate without interrupting",
    description:
      "Sometimes you need to share a link, paste an error message, or communicate without interrupting the flow. Our real-time chat with typing indicators and persistent message history keeps the conversation going alongside the code — perfect for sharing resources or quick clarifications.",
    highlights: ["Typing indicators", "Message history", "Link sharing", "File attachments"],
    previewType: "chat" as const,
  },
  {
    icon: PenLine,
    badge: "DESIGN",
    title: "Collaborative Whiteboard",
    headline: "Design systems visually",
    description:
      "System design interviews deserve a proper canvas. Draw architecture diagrams, flowcharts, and data models together in real-time. Every stroke syncs instantly via Socket.IO, so both participants see the same picture. Export your designs for post-interview review.",
    highlights: ["Real-time drawing sync", "Shape & text tools", "System design templates", "Export to image"],
    previewType: "whiteboard" as const,
  },
  {
    icon: Zap,
    badge: "EXECUTION",
    title: "Code Execution",
    headline: "Run code instantly, see results live",
    description:
      "Candidates can execute their solutions right in the browser using our sandboxed Judge0 integration. See stdout, stderr, execution time, and memory usage in real-time. Support for custom test cases means you can validate edge cases on the spot — no switching tabs required.",
    highlights: ["Sandboxed execution", "Custom test cases", "Performance metrics", "Multi-language support"],
    previewType: "execution" as const,
  },
];

const stats = [
  { value: "7+", label: "Languages" },
  { value: "<100ms", label: "Sync Latency" },
  { value: "P2P", label: "Video Calls" },
  { value: "AI", label: "Powered" },
];

// logos for companies/colleges using InterviewOS
// ...existing code...

const previewChatLines = [
  { sender: "Alex", text: "Can you walk me through your approach?" },
  { sender: "Jordan", text: "Sure! I'm using a hash map for O(n) lookup..." },
  { sender: "Alex", text: "Great! What about edge cases?" },
];

const CountUpValue: React.FC<{
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}> = ({ end, duration = 2600, decimals = 0, suffix = "" }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setValue(end * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [end, duration]);

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return <>{formatted}{suffix}</>;
};

const faqCategories = [
  "Platform & Features",
  "Interview Process",
  "AI & Feedback",
  "Account & Pricing",
  "Technical Support",
  "Privacy & Security",
];

const faqData: Record<string, { question: string; answer: string }[]> = {
  "Platform & Features": [
    {
      question: "What is InterviewOS?",
      answer:
        "InterviewOS is an all-in-one interview platform that combines live video calls, real-time collaborative code editor, AI-powered feedback, and structured evaluation — all in one seamless experience.",
    },
    {
      question: "What features does InterviewOS offer?",
      answer:
        "InterviewOS includes HD video calling, real-time code editor with syntax highlighting, AI-driven candidate scoring, live chat, screen sharing, interview recording, and detailed feedback reports.",
    },
    {
      question:
        "Can I use InterviewOS for both technical and non-technical interviews?",
      answer:
        "Yes! While our code editor is built for technical interviews, the video, chat, and feedback features work perfectly for any type of interview — behavioral, HR, or managerial rounds.",
    },
    {
      question: "Does InterviewOS support multiple programming languages?",
      answer:
        "Absolutely. Our code editor supports 20+ languages including JavaScript, Python, Java, C++, Go, Rust, TypeScript, and more.",
    },
  ],
  "Interview Process": [
    {
      question: "How do I start an interview on InterviewOS?",
      answer:
        "Simply create an interview room from your dashboard, share the unique room link with the candidate, and both of you can join with one click — no downloads needed.",
    },
    {
      question: "Can I schedule interviews in advance?",
      answer:
        "Yes, you can schedule interviews with date, time, and candidate details. Automated email invitations are sent to participants with the room link.",
    },
    {
      question: "Is there a time limit for interviews?",
      answer:
        "Free plan interviews are limited to 45 minutes. Pro and Enterprise plans offer unlimited interview duration.",
    },
    {
      question: "Can multiple interviewers join the same session?",
      answer:
        "Yes! InterviewOS supports panel interviews with up to 5 interviewers in a single room, each with independent evaluation capabilities.",
    },
  ],
  "AI & Feedback": [
    {
      question: "How does the AI feedback work?",
      answer:
        "Our AI analyzes the candidate's code quality, problem-solving approach, communication skills, and time management in real-time. After the interview, it generates a comprehensive scorecard with actionable insights.",
    },
    {
      question: "Is the AI feedback accurate?",
      answer:
        "Our AI model has been trained on thousands of real interview evaluations and maintains 92%+ correlation with expert human reviewers. It's designed to assist, not replace, human judgment.",
    },
    {
      question: "Can I customize the AI evaluation criteria?",
      answer:
        "Yes, Pro users can customize scoring rubrics, weight different skills, and add company-specific evaluation parameters.",
    },
    {
      question: "Does the AI provide feedback to candidates too?",
      answer:
        "Interviewers can choose to share AI-generated feedback with candidates, including strengths, areas for improvement, and suggested learning resources.",
    },
  ],
  "Account & Pricing": [
    {
      question: "Is InterviewOS free to use?",
      answer:
        "Yes! We offer a generous free plan with up to 5 interviews per month, basic AI feedback, and all core features. Pro and Enterprise plans unlock unlimited interviews and advanced features.",
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer:
        "Absolutely. You can switch plans at any time from your account settings. Upgrades take effect immediately, and downgrades apply at the next billing cycle.",
    },
    {
      question: "Do you offer team or enterprise pricing?",
      answer:
        "Yes, we offer custom enterprise plans with volume discounts, dedicated support, SSO integration, and custom branding. Contact our sales team for a quote.",
    },
    {
      question: "Is there a student discount?",
      answer:
        "Yes! Students with a valid .edu email get 50% off all paid plans. We're committed to making great interview tools accessible to everyone.",
    },
  ],
  "Technical Support": [
    {
      question: "What browsers are supported?",
      answer:
        "InterviewOS works best on Chrome, Firefox, Edge, and Safari (latest versions). We recommend Chrome for the best experience with video and code editor features.",
    },
    {
      question: "Do I need to install anything?",
      answer:
        "No! InterviewOS runs entirely in your browser. No downloads, plugins, or installations required — just open the link and you're ready to go.",
    },
    {
      question: "What if I face audio/video issues during an interview?",
      answer:
        "Our built-in diagnostics tool checks your camera, microphone, and network before the interview. If issues persist, our support team is available 24/7 via live chat.",
    },
    {
      question: "Can I record interviews?",
      answer:
        "Yes, Pro users can record interviews with consent from all participants. Recordings are securely stored and accessible from your dashboard.",
    },
  ],
  "Privacy & Security": [
    {
      question: "Is my interview data secure?",
      answer:
        "Absolutely. All data is encrypted end-to-end using AES-256 encryption. We're SOC 2 Type II compliant and follow industry-best security practices.",
    },
    {
      question: "Who can access my interview recordings?",
      answer:
        "Only the interview creator and authorized team members can access recordings. Candidates cannot access recordings unless explicitly shared by the interviewer.",
    },
    {
      question: "Does InterviewOS sell user data?",
      answer:
        "Never. We do not sell, share, or monetize your personal or interview data. Your privacy is our top priority. Read our full privacy policy for details.",
    },
    {
      question: "Can I delete my account and data?",
      answer:
        "Yes, you can request complete account deletion from your settings. All your data, including recordings and feedback, will be permanently removed within 30 days.",
    },
  ],
};

// Animated code editor with typing effect
const codeLines = [
  { indent: 0, tokens: [{ text: "def ", color: "#cba6f7" }, { text: "two_sum", color: "#89b4fa" }, { text: "(nums, target):", color: "#cdd6f4" }] },
  { indent: 1, tokens: [{ text: "seen = {}", color: "#cdd6f4" }] },
  { indent: 1, tokens: [{ text: "for ", color: "#cba6f7" }, { text: "i, num ", color: "#cdd6f4" }, { text: "in ", color: "#cba6f7" }, { text: "enumerate", color: "#89b4fa" }, { text: "(nums):", color: "#cdd6f4" }] },
  { indent: 2, tokens: [{ text: "diff = target - num", color: "#cdd6f4" }] },
  { indent: 2, tokens: [{ text: "if ", color: "#cba6f7" }, { text: "diff ", color: "#cdd6f4" }, { text: "in ", color: "#cba6f7" }, { text: "seen:", color: "#cdd6f4" }] },
  { indent: 3, tokens: [{ text: "return ", color: "#cba6f7" }, { text: "[seen[diff], i]", color: "#cdd6f4" }] },
  { indent: 2, tokens: [{ text: "seen[num] = i", color: "#cdd6f4" }] },
];

const totalCodeChars = codeLines.reduce((acc, line) => acc + line.tokens.reduce((a, t) => a + t.text.length, 0), 0);

function AnimatedCodeEditor() {
  const [displayedChars, setDisplayedChars] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInView = useInView(editorRef, { once: false, margin: "-100px" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    // Clear all pending timers
    cancelledRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!editorInView) {
      setDisplayedChars(0);
      return;
    }

    cancelledRef.current = false;
    let idx = 0;
    setDisplayedChars(0);

    const getDelay = (charIdx: number) => {
      let count = 0;
      for (const line of codeLines) {
        const lineText = line.tokens.map(t => t.text).join("");
        const lineEnd = count + lineText.length;
        if (charIdx <= lineEnd) {
          const posInLine = charIdx - count;
          // End of line → longer pause
          if (posInLine === lineText.length) return 250 + Math.random() * 150;
          const char = lineText[posInLine - 1];
          if (char === ":" || char === "=") return 80 + Math.random() * 60;
          break;
        }
        count = lineEnd;
      }
      return 40 + Math.random() * 25;
    };

    const step = () => {
      if (cancelledRef.current) return;
      if (idx <= totalCodeChars) {
        setDisplayedChars(idx);
        const delay = getDelay(idx);
        idx++;
        timerRef.current = setTimeout(step, delay);
      } else {
        // Finished — wait then restart
        timerRef.current = setTimeout(() => {
          if (cancelledRef.current) return;
          idx = 0;
          setDisplayedChars(0);
          timerRef.current = setTimeout(step, 600);
        }, 3000);
      }
    };

    timerRef.current = setTimeout(step, 500);

    return () => {
      cancelledRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [editorInView]);

  const isTyping = displayedChars > 0 && displayedChars < totalCodeChars;

  // Render code with typing effect
  const renderTypedCode = () => {
    let globalCharIndex = 0;
    const result: React.ReactNode[] = [];

    for (let lineIdx = 0; lineIdx < codeLines.length; lineIdx++) {
      const line = codeLines[lineIdx];
      const lineText = line.tokens.map(t => t.text).join("");
      const lineStart = globalCharIndex;
      const lineEnd = globalCharIndex + lineText.length;

      if (lineStart >= displayedChars) break;

      const indentPx = line.indent * 16;
      const spans: React.ReactNode[] = [];
      let tokenStart = lineStart;
      let cursorPlaced = false;

      for (const token of line.tokens) {
        const tokenEnd = tokenStart + token.text.length;
        if (tokenStart >= displayedChars) break;

        const visible = Math.min(displayedChars - tokenStart, token.text.length);
        const text = token.text.slice(0, visible);

        if (text) {
          spans.push(<span key={tokenStart} style={{ color: token.color }}>{text}</span>);
        }

        // Place cursor right after the last visible character
        if (!cursorPlaced && displayedChars > tokenStart && displayedChars < tokenEnd) {
          spans.push(
            <span key="cursor" className="inline-block w-[2px] h-[14px] bg-[#cdd6f4] align-middle ml-[1px]" style={{ animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
          );
          cursorPlaced = true;
        }

        tokenStart = tokenEnd;
      }

      // Cursor at end of line (between lines)
      if (!cursorPlaced && displayedChars >= lineEnd && displayedChars < totalCodeChars) {
        if (lineIdx === codeLines.length - 1 || displayedChars === lineEnd) {
          // Only show on the current line end, not all previous lines
          const nextLineStart = lineEnd;
          if (displayedChars === nextLineStart) {
            spans.push(
              <span key="cursor-eol" className="inline-block w-[2px] h-[14px] bg-[#cdd6f4] align-middle ml-[1px]" style={{ animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            );
          }
        }
      }

      const isHighlightedLine = lineIdx === 4 && displayedChars > lineEnd;

      result.push(
        <div key={lineIdx} className={`flex items-baseline ${isHighlightedLine ? "bg-[#313244]/50 -mx-4 px-4 rounded" : ""}`}>
          <span className="w-8 text-[#6c7086] select-none shrink-0">{lineIdx + 1}</span>
          <span style={{ paddingLeft: `${indentPx}px` }}>{spans}</span>
        </div>
      );

      globalCharIndex = lineEnd;
    }

    // Show blinking cursor before any code is typed
    if (displayedChars === 0) {
      return (
        <div className="flex items-baseline">
          <span className="w-8 text-[#6c7086] select-none shrink-0">1</span>
          <span className="inline-block w-[2px] h-[14px] bg-[#cdd6f4] align-middle" style={{ animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
        </div>
      );
    }

    return result;
  };

  return (
    <div ref={editorRef} className="rounded-xl overflow-hidden border border-border bg-[#1e1e2e] shadow-2xl">
      {/* Editor top bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#181825] border-b border-[#313244]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-3 text-xs text-[#cdd6f4]/60 font-mono">solution.py</span>
        <div className="ml-auto flex items-center gap-2 text-xs text-[#cdd6f4]/40">
          {isTyping && (
            <span className="flex items-center gap-1.5 text-[#a6e3a1] text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse" />
              typing...
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-[#313244] text-[#89b4fa]">Python</span>
        </div>
      </div>
      {/* Code lines with typing animation */}
      <div className="p-4 font-mono text-xs sm:text-sm leading-6 min-h-[220px]">
        {renderTypedCode()}
      </div>
    </div>
  );
}

// Animated Video Call preview
function AnimatedVideoCall() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) { setStep(0); return; }
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1000),
      setTimeout(() => setStep(3), 1800),
      setTimeout(() => setStep(4), 2600),
      setTimeout(() => setStep(5), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="rounded-xl overflow-hidden border border-border bg-[#1e1e2e] shadow-2xl">
      <div className="grid grid-cols-2 gap-0.5 bg-[#313244]">
        {/* Interviewer video */}
        <div className="aspect-video bg-gradient-to-br from-[#1e1e2e] to-[#313244] flex items-center justify-center relative overflow-hidden">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={step >= 1 ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <Users className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={step >= 2 ? { opacity: 1, y: 0 } : {}}
            className="absolute bottom-2 left-3 text-xs text-white/70 bg-black/40 px-2 py-0.5 rounded"
          >Alex (Interviewer)</motion.span>
          <motion.div
            initial={{ opacity: 0 }}
            animate={step >= 2 ? { opacity: 1 } : {}}
            className="absolute top-2 right-2 flex items-center gap-1.5"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-green-400">HD</span>
          </motion.div>
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent"
            />
          )}
        </div>
        {/* Candidate video */}
        <div className="aspect-video bg-gradient-to-br from-[#313244] to-[#1e1e2e] flex items-center justify-center relative overflow-hidden">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={step >= 2 ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-16 h-16 rounded-full bg-[#89b4fa]/20 flex items-center justify-center"
          >
            <Users className="w-8 h-8 text-[#89b4fa]" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={step >= 3 ? { opacity: 1, y: 0 } : {}}
            className="absolute bottom-2 left-3 text-xs text-white/70 bg-black/40 px-2 py-0.5 rounded"
          >Jordan (Candidate)</motion.span>
          {step >= 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#89b4fa]/20 text-[9px] text-[#89b4fa]"
            >Screen Sharing</motion.div>
          )}
        </div>
      </div>
      {/* Controls */}
      <div className="flex items-center justify-center gap-3 p-3 bg-[#181825]">
        {[
          { icon: Mic, delay: 0 },
          { icon: Video, delay: 0.1 },
          { icon: Monitor, delay: 0.2 },
        ].map((ctrl, idx) => (
          <motion.button
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            animate={step >= 4 ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: ctrl.delay, type: "spring", stiffness: 300 }}
            className="p-2 rounded-full bg-[#313244] text-[#cdd6f4]"
          >
            <ctrl.icon className="w-4 h-4" />
          </motion.button>
        ))}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={step >= 5 ? { scale: 1, opacity: 1 } : {}}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-2.5 rounded-full bg-red-500 text-white"
        >
          <PhoneOff className="w-4 h-4" />
        </motion.button>
      </div>
      {/* Connection quality bar */}
      {step >= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between px-4 py-1.5 bg-[#181825] border-t border-[#313244] text-[10px]"
        >
          <span className="text-[#6c7086]">Connection Quality</span>
          <div className="flex items-center gap-1.5">
            {/* Animated WiFi bars */}
            <div className="flex items-end gap-[2px]">
              {[1, 2, 3, 4, 5].map((bar) => (
                <motion.div
                  key={bar}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: [0.4, 1, 0.4] }}
                  transition={{
                    delay: bar * 0.15,
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }}
                  className="w-1 rounded-full bg-[#a6e3a1] origin-bottom"
                  style={{ height: `${bar * 3 + 2}px` }}
                />
              ))}
            </div>
            <span className="text-[#a6e3a1] ml-1">Good</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Animated AI Assistant preview
function AnimatedAIChat() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [typingAI, setTypingAI] = useState(false);
  const [aiText, setAiText] = useState("");

  const aiFullText = "💡 Hint Level 1: Think about what data structure allows O(1) lookups. Consider using a hash map to store values you've already seen.";

  useEffect(() => {
    if (!inView) { setVisibleMessages(0); setTypingAI(false); setAiText(""); return; }

    const t1 = setTimeout(() => setVisibleMessages(1), 500);
    const t2 = setTimeout(() => setTypingAI(true), 1500);
    const t3 = setTimeout(() => {
      setTypingAI(false);
      // Start typing AI response
      let idx = 0;
      const typeInterval = setInterval(() => {
        idx++;
        if (idx <= aiFullText.length) {
          setAiText(aiFullText.slice(0, idx));
        } else {
          clearInterval(typeInterval);
          setVisibleMessages(2);
          setTimeout(() => setVisibleMessages(3), 1200);
        }
      }, 20);
    }, 2800);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [inView]);

  return (
    <div ref={ref} className="rounded-xl overflow-hidden border border-border bg-[#1e1e2e] shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#181825] border-b border-[#313244]">
        <Brain className="w-4 h-4 text-[#cba6f7]" />
        <span className="text-xs text-[#cdd6f4] font-medium">AI Assistant</span>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-[#a6e3a1]/10 text-[#a6e3a1] text-[10px]">GPT-4o</span>
      </div>
      <div className="p-4 space-y-3 min-h-[200px]">
        {/* User message 1 */}
        {visibleMessages >= 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[#89b4fa]/20 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-3 h-3 text-[#89b4fa]" />
            </div>
            <div className="bg-[#313244] rounded-lg rounded-tl-none px-3 py-2 text-xs text-[#cdd6f4]">
              I'm stuck on optimizing this solution. It's O(n²) right now.
            </div>
          </motion.div>
        )}

        {/* AI typing indicator */}
        {typingAI && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[#cba6f7]/20 flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="w-3 h-3 text-[#cba6f7]" />
            </div>
            <div className="bg-[#cba6f7]/10 rounded-lg rounded-tl-none px-3 py-2 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#cba6f7] animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#cba6f7] animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#cba6f7] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}

        {/* AI response with typing */}
        {aiText && !typingAI && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[#cba6f7]/20 flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="w-3 h-3 text-[#cba6f7]" />
            </div>
            <div className="bg-[#cba6f7]/10 rounded-lg rounded-tl-none px-3 py-2 text-xs text-[#cdd6f4] space-y-1.5">
              <p>{aiText}<span className={`inline-block w-[2px] h-[12px] bg-[#cba6f7] align-middle ml-[1px] ${aiText.length < aiFullText.length ? "animate-pulse" : "hidden"}`} /></p>
            </div>
          </motion.div>
        )}

        {/* User response */}
        {visibleMessages >= 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[#89b4fa]/20 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-3 h-3 text-[#89b4fa]" />
            </div>
            <div className="bg-[#313244] rounded-lg rounded-tl-none px-3 py-2 text-xs text-[#cdd6f4]">
              Got it! Using a dictionary to check complements. Thanks!
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Animated Room Chat preview
function AnimatedRoomChat() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isTypingInput, setIsTypingInput] = useState(false);
  const [inputText, setInputText] = useState("");

  const chatMessages = [
    { sender: "right", text: "Here's the API docs link: docs.api.com/v2" },
    { sender: "left", text: "Thanks! Let me check the rate limits." },
    { sender: "right", text: "No worries, take your time 👍" },
  ];

  const typingText = "I found the issue, it's a CORS error";

  useEffect(() => {
    if (!inView) { setVisibleMessages(0); setIsTypingInput(false); setInputText(""); return; }

    const timers = [
      setTimeout(() => setVisibleMessages(1), 400),
      setTimeout(() => setVisibleMessages(2), 1200),
      setTimeout(() => setVisibleMessages(3), 2200),
      setTimeout(() => {
        setIsTypingInput(true);
        let idx = 0;
        const typeInterval = setInterval(() => {
          idx++;
          if (idx <= typingText.length) {
            setInputText(typingText.slice(0, idx));
          } else {
            clearInterval(typeInterval);
            setTimeout(() => {
              setIsTypingInput(false);
              setInputText("");
              setVisibleMessages(4);
            }, 500);
          }
        }, 50);
      }, 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="rounded-xl overflow-hidden border border-border bg-[#1e1e2e] shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#181825] border-b border-[#313244]">
        <MessageSquare className="w-4 h-4 text-[#89b4fa]" />
        <span className="text-xs text-[#cdd6f4] font-medium">Room Chat</span>
        <span className="ml-auto text-[10px] text-[#6c7086]">2 participants</span>
      </div>
      <div className="p-4 space-y-3 min-h-[220px]">
        {chatMessages.slice(0, visibleMessages).map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={msg.sender === "right" ? "flex justify-end" : "flex gap-2"}
          >
            {msg.sender === "left" && (
              <div className="w-6 h-6 rounded-full bg-[#a6e3a1]/20 flex items-center justify-center shrink-0">
                <span className="text-[10px] text-[#a6e3a1] font-bold">J</span>
              </div>
            )}
            <div className={`rounded-lg px-3 py-2 text-xs text-[#cdd6f4] max-w-[80%] ${
              msg.sender === "right"
                ? "bg-primary/20 rounded-tr-none"
                : "bg-[#313244] rounded-tl-none"
            }`}>
              {msg.text.includes("docs.api.com") ? (
                <>Here's the API docs link: <span className="text-[#89b4fa] underline">docs.api.com/v2</span></>
              ) : msg.text}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator for Jordan */}
        {visibleMessages >= 3 && visibleMessages < 4 && !isTypingInput && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center">
            <div className="w-6 h-6 rounded-full bg-[#a6e3a1]/20 flex items-center justify-center shrink-0">
              <span className="text-[10px] text-[#a6e3a1] font-bold">J</span>
            </div>
            <div className="flex gap-1 px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#6c7086] animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#6c7086] animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-[#6c7086] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}

        {/* Jordan's new message after typing */}
        {visibleMessages >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-[#a6e3a1]/20 flex items-center justify-center shrink-0">
              <span className="text-[10px] text-[#a6e3a1] font-bold">J</span>
            </div>
            <div className="bg-[#313244] rounded-lg rounded-tl-none px-3 py-2 text-xs text-[#cdd6f4]">
              {typingText}
            </div>
          </motion.div>
        )}
      </div>
      {/* Input bar with typing animation */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-[#313244]">
        <div className="flex-1 bg-[#313244] rounded-lg px-3 py-1.5 text-xs text-[#cdd6f4] min-h-[28px] flex items-center">
          {isTypingInput ? (
            <span>{inputText}<span className="inline-block w-[2px] h-[12px] bg-[#cdd6f4] align-middle animate-pulse ml-[1px]" /></span>
          ) : (
            <span className="text-[#6c7086]">Type a message...</span>
          )}
        </div>
        <motion.div animate={isTypingInput ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
          <Send className={`w-4 h-4 ${isTypingInput ? "text-primary" : "text-[#6c7086]"} transition-colors`} />
        </motion.div>
      </div>
    </div>
  );
}

// Animated Whiteboard preview
function AnimatedWhiteboard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });
  const [step, setStep] = useState(0);

  const nodes = [
    { label: "Client", color: "#89b4fa", row: 0, col: 0, step: 1 },
    { label: "Load Balancer", color: "#a6e3a1", row: 0, col: 1, step: 2 },
    { label: "API Server", color: "#cba6f7", row: 0, col: 2, step: 3 },
    { label: "PostgreSQL", color: "#f9e2af", row: 1, col: 0, step: 5 },
    { label: "Redis Cache", color: "#f38ba8", row: 1, col: 1, step: 6 },
    { label: "S3 Storage", color: "#89b4fa", row: 1, col: 2, step: 7 },
  ];
  const arrows = [
    { step: 2, type: "h" as const },
    { step: 3, type: "h" as const },
    { step: 4, type: "v" as const },
  ];

  useEffect(() => {
    if (!inView) { setStep(0); return; }
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setStep(current);
      if (current >= 8) clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <div ref={ref} className="rounded-xl overflow-hidden border border-border bg-[#1e1e2e] shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#181825] border-b border-[#313244]">
        <Layout className="w-4 h-4 text-[#f9e2af]" />
        <span className="text-xs text-[#cdd6f4] font-medium">System Design Canvas</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-[#a6e3a1]">
          <Wifi className="w-3 h-3" /> Live Sync
        </span>
      </div>
      <div className="p-6 relative min-h-[220px]">
        {/* Top row: Client → Load Balancer → API Server */}
        <div className="flex items-center justify-center gap-4">
          {nodes.filter(n => n.row === 0).map((node, idx) => (
            <React.Fragment key={node.label}>
              {idx > 0 && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={step >= arrows[idx - 1].step ? { opacity: 1, scaleX: 1 } : {}}
                  transition={{ duration: 0.3 }}
                  className="text-[#6c7086] origin-left"
                >→</motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={step >= node.step ? { opacity: 1, scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="px-3 py-2 rounded-lg border-2"
                style={{ borderColor: node.color, backgroundColor: `${node.color}15`, color: node.color }}
              >
                <span className="text-[10px] font-medium">{node.label}</span>
              </motion.div>
            </React.Fragment>
          ))}
        </div>

        {/* Vertical arrow */}
        <div className="flex justify-center mt-3">
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={step >= 4 ? { opacity: 1, scaleY: 1 } : {}}
            transition={{ duration: 0.3 }}
            className="text-[#6c7086] text-xs origin-top"
          >↓</motion.div>
        </div>

        {/* Bottom row: DB nodes */}
        <div className="flex items-center justify-center gap-6 mt-2">
          {nodes.filter(n => n.row === 1).map((node) => (
            <motion.div
              key={node.label}
              initial={{ opacity: 0, y: 20 }}
              animate={step >= node.step ? { opacity: 1, y: 0 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="px-3 py-2 rounded-lg border-2"
              style={{ borderColor: node.color, backgroundColor: `${node.color}15`, color: node.color }}
            >
              <span className="text-[10px] font-medium">{node.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Animated cursor */}
        {step >= 1 && step < 8 && (
          <motion.div
            animate={{
              x: [0, 50, 100, 150, 100, 50, 0],
              y: [0, -5, 0, 5, 10, 5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 right-8"
          >
            <PenLine className="w-4 h-4 text-primary" />
          </motion.div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#313244]">
          {[
            { icon: PenLine, active: false },
            { icon: Layout, active: true },
            { icon: MessageSquare, active: false },
            { icon: ArrowRight, active: false },
          ].map((tool, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={step >= 8 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1 }}
              className={`p-1.5 rounded ${tool.active ? "bg-primary/20" : "bg-[#313244]"}`}
            >
              <tool.icon className={`w-3 h-3 ${tool.active ? "text-primary" : "text-[#cdd6f4]"}`} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Animated Code Execution preview
function AnimatedExecution() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });
  const [step, setStep] = useState(0);

  const tests = [
    { name: "Test 1", time: "2ms", step: 2 },
    { name: "Test 2", time: "1ms", step: 3 },
    { name: "Test 3", time: "3ms", step: 4 },
  ];

  useEffect(() => {
    if (!inView) { setStep(0); return; }
    const timers = [
      setTimeout(() => setStep(1), 400),   // "Running..."
      setTimeout(() => setStep(2), 1200),   // Test 1
      setTimeout(() => setStep(3), 2000),   // Test 2
      setTimeout(() => setStep(4), 2800),   // Test 3
      setTimeout(() => setStep(5), 3600),   // Stats
    ];
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="rounded-xl overflow-hidden border border-border bg-[#1e1e2e] shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#181825] border-b border-[#313244]">
        <Terminal className="w-4 h-4 text-[#a6e3a1]" />
        <span className="text-xs text-[#cdd6f4] font-medium">Execution Output</span>
        {step >= 5 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-auto flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#a6e3a1]" />
            <span className="text-[10px] text-[#a6e3a1]">All tests passed</span>
          </motion.span>
        )}
        {step >= 1 && step < 5 && (
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-[#f9e2af]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-3 h-3 border border-[#f9e2af] border-t-transparent rounded-full" />
            Running...
          </span>
        )}
      </div>
      <div className="p-4 font-mono text-xs space-y-2 min-h-[200px]">
        {/* Compiling step */}
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-[#6c7086]"
          >
            <Play className="w-3 h-3" />
            <span>Compiling solution.py...</span>
          </motion.div>
        )}

        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 2 ? 1 : 0.5 }}
            className="flex items-center gap-2 text-[#6c7086]"
          >
            <Play className="w-3 h-3" />
            <span>Running test cases...</span>
          </motion.div>
        )}

        {/* Test results */}
        <div className="space-y-1.5 pt-1">
          {tests.map((test) => (
            step >= test.step && (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#a6e3a1]" />
                </motion.div>
                <span className="text-[#cdd6f4]">{test.name}: <span className="text-[#a6e3a1]">PASSED</span></span>
                <span className="ml-auto text-[#6c7086]">{test.time}</span>
              </motion.div>
            )
          ))}
        </div>

        {/* Stats */}
        {step >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 mt-2 border-t border-[#313244] grid grid-cols-3 gap-2"
          >
            {[
              { value: "6ms", label: "Runtime", color: "#89b4fa" },
              { value: "2.1MB", label: "Memory", color: "#cba6f7" },
              { value: "3/3", label: "Passed", color: "#a6e3a1" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.15, type: "spring", stiffness: 300 }}
                className="text-center"
              >
                <div className="font-semibold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[#6c7086] text-[10px]">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Progress bar during running */}
        {step >= 1 && step < 5 && (
          <motion.div className="mt-2 h-1 bg-[#313244] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#a6e3a1] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: step >= 4 ? "100%" : step >= 3 ? "66%" : step >= 2 ? "33%" : "10%" }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenShareOn, setIsScreenShareOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(true);
  const [activeCategory, setActiveCategory] = useState(faqCategories[0]);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const [testimonialsPaused, setTestimonialsPaused] = useState(false);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const testimonialsInView = useInView(testimonialsRef, {
    once: true,
    amount: 0.2,
  });
  const pauseTimeouts = useRef<{
    testimonials?: ReturnType<typeof setTimeout>;
  }>({});

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    return () => {
      if (pauseTimeouts.current.testimonials) {
        clearTimeout(pauseTimeouts.current.testimonials);
      }
    };
  }, []);

  const handleMarqueePause = (
    key: "testimonials",
    setPaused: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setPaused(true);
    if (pauseTimeouts.current[key]) {
      clearTimeout(pauseTimeouts.current[key]);
    }
    pauseTimeouts.current[key] = setTimeout(() => {
      setPaused(false);
    }, 1500);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentChatStep, setCurrentChatStep] = useState(0);

  // Rotating hero words - typewriter effect
  const heroWords = [
    "Engineers",
    "Developers",
    "Problem Solvers",
    "Coders",
    "Innovators",
    "Builders",
    "Tech Leaders",
    "Thinkers",
  ];
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = heroWords[heroWordIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentWord) {
      // Pause at full word
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayText === "") {
      // Move to next word
      setIsDeleting(false);
      setHeroWordIndex((prev) => (prev + 1) % heroWords.length);
    } else if (isDeleting) {
      // Delete characters
      timeout = setTimeout(() => {
        setDisplayText(currentWord.substring(0, displayText.length - 1));
      }, 50);
    } else {
      // Type characters
      timeout = setTimeout(() => {
        setDisplayText(currentWord.substring(0, displayText.length + 1));
      }, 100);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, heroWordIndex]);

  // track which preview line currently has the blinking caret
  const [activeLine, setActiveLine] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const runLoop = () => {
      setCurrentChatStep((prev) => {
        const totalSteps = previewChatLines.length * 2;
        const next = (prev + 1) % (totalSteps + 2);

        let delay = 1000;
        if (next === 0) {
          delay = 500;
        } else if (next > totalSteps) {
          delay = 3000;
        } else if (next % 2 === 1) {
          delay = 1500;
        } else {
          delay = 3000;
        }

        timeout = setTimeout(runLoop, delay);
        return next;
      });
    };

    timeout = setTimeout(runLoop, 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let i = 0;
    const step = () => {
      setActiveLine(i);
      if (i < previewCodeLines.length - 1) {
        i += 1;
        setTimeout(step, 500);
      }
    };
    step();
  }, []);

  const previewCodeLines: React.ReactNode[] = [
    <>
      <span className="text-primary/70">function</span> twoSum(nums:{" "}
      <span className="text-warning">number</span>[], target:{" "}
      <span className="text-warning">number</span>):{" "}
      <span className="text-warning">number</span>[] {"{"}
    </>,
    <>
      <span className="text-primary/70"> const</span> map ={" "}
      <span className="text-primary/70">new</span>{" "}
      <span className="text-info">Map</span>&lt;
      <span className="text-warning">number</span>,{" "}
      <span className="text-warning">number</span>&gt;();
    </>,
    <>
      <span className="text-primary/70"> for</span> (
      <span className="text-primary/70">let</span> i ={" "}
      <span className="text-success">0</span>; i &lt; nums.length; i++) {"{"}
    </>,
    <>&nbsp;&nbsp;&nbsp;&nbsp;const complement = target - nums[i];</>,
    <>
      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary/70">if</span> (map.
      <span className="text-info">has</span>(complement)) {"{"}
    </>,
    <>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span className="text-primary/70">return</span> [map.
      <span className="text-info">get</span>(complement)!, i];
    </>,
    <>&nbsp;&nbsp;&nbsp;&nbsp;{"}"}</>,
    <>
      &nbsp;&nbsp;&nbsp;&nbsp;map.<span className="text-info">set</span>
      (nums[i], i);
    </>,
    <>&nbsp;&nbsp;&nbsp;&nbsp;{"}"}</>,
    <>
      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary/70">return</span>{" "}
      [];
    </>,
    <>{"}"}</>,
  ];

  const testimonials: {
    name: string;
    handle: string;
    text: string;
    platform: "linkedin" | "twitter" | "reddit";
    avatar: string;
    role?: string;
    likes?: number;
    time?: string;
  }[] = [
    {
      name: "Sundar Pichai",
      handle: "sundarpichai",
      text: "At Google, we interview 3 million people a year. With InterviewOS, I could have done it from one Chrome tab. Real-time code sync, AI feedback, and zero buffering. Even Google Meet is jealous. 🫣🚀",
      platform: "linkedin",
      avatar: ceoSundar,
      role: "CEO @ Google",
      likes: 24500,
      time: "2d",
    },
    {
      name: "Tim Cook",
      handle: "tim-cook",
      text: "InterviewOS is what happens when innovation meets simplicity. Clean UI, seamless experience, and it just works™. We might have to sue them for being too good. Courage. 🍎✨",
      platform: "linkedin",
      avatar: ceoApple,
      role: "CEO @ Apple",
      likes: 18700,
      time: "4d",
    },
    {
      name: "Bill Gates",
      handle: "u/thisisbillgates",
      text: "Back in my day, we did interviews on a landline phone. InterviewOS makes me wish I was born 30 years later. The AI scoring is remarkably accurate. I tried to buy it but they said it's not for sale. Yet. 📞→💻",
      platform: "reddit",
      avatar: ceoBillGates,
      likes: 31200,
      time: "6h",
    },
    {
      name: "Sam Altman",
      handle: "@sama",
      text: "InterviewOS's AI feedback is so good, I thought it was GPT-5. It's not. It's better. Acquisition talks starting Monday. Not a drill. 👀💰 #InterviewOStoOpenAI",
      platform: "twitter",
      avatar: ceoSamAltman,
      likes: 120000,
      time: "1h",
    },
    {
      name: "Jensen Huang",
      handle: "u/jensen_huang",
      text: "I make GPUs that power AI, but the real AI magic is in InterviewOS's feedback engine. It scores candidates better than most interviewers I know. Including some at NVIDIA. Don't @ me. Leather jacket approved. 🧥😎",
      platform: "reddit",
      avatar: ceoJensen,
      likes: 21000,
      time: "12h",
    },
    {
      name: "Mark Zuckerberg",
      handle: "@zuck",
      text: "Tried conducting an interview in the Metaverse. Candidate's avatar kept T-posing. Switched to InterviewOS. Best pivot since Instagram Reels. No VR headset needed lol 🤣 #efficiency",
      platform: "twitter",
      avatar: ceoMark,
      likes: 45000,
      time: "8h",
    },
    {
      name: "Satya Nadella",
      handle: "satyanadella",
      text: "As someone who runs Microsoft, I appreciate great software — and InterviewOS is genuinely great software. Better video calling than Teams. Yes, I said it. Growth mindset means accepting the truth. 💀📈",
      platform: "linkedin",
      avatar: ceoSatya,
      role: "CEO @ Microsoft",
      likes: 15600,
      time: "1d",
    },
    {
      name: "Narendra Modi",
      handle: "@naaborendramodi",
      text: "Mitron! 🇮🇳 InterviewOS is a shining example of Digital India. Ab interview bhi digital, feedback bhi AI se. Make in India, Interview on InterviewOS! Jai Hind! 🙏 #AatmaNirbharBharat #InterviewOS",
      platform: "twitter",
      avatar: ceoModi,
      likes: 250000,
      time: "3h",
    },
    {
      name: "Rahul Gandhi",
      handle: "u/rahulgandhi_official",
      text: "Maine InterviewOS use karke ek mock interview diya. AI ne bola — 'Great potential, needs more preparation.' Relatable content. But seriously, the platform is very user-friendly. Even I figured it out. 😅🫡",
      platform: "reddit",
      avatar: ceoRahul,
      likes: 42000,
      time: "9h",
    },
    {
      name: "Pavel Durov",
      handle: "@durov",
      text: "InterviewOS respects your privacy more than most platforms. No tracking, no nonsense, just pure interview experience. If Telegram had a hiring feature, it would look exactly like this. 🔒🚀 #Freedom #InterviewOS",
      platform: "twitter",
      avatar: ceoPavel,
      likes: 67000,
      time: "5h",
    },
  ];

  // Feature preview mockup renderer
  const renderFeaturePreview = (type: string) => {
    switch (type) {
      case "editor":
        return <AnimatedCodeEditor />;

      case "video":
        return <AnimatedVideoCall />;

      case "ai":
        return <AnimatedAIChat />;

      case "chat":
        return <AnimatedRoomChat />;

      case "whiteboard":
        return <AnimatedWhiteboard />;

      case "execution":
        return <AnimatedExecution />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img
              src={isDark ? logo : logoLight}
              alt="InterviewOS Logo"
              className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
            />
          </a>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-12">
            <a href="/" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors duration-200">
              <Home className="w-4 h-4" /> Home
            </a>
            <a href="#features" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors duration-200">
              <Sparkles className="w-4 h-4" /> Features
            </a>
            <a href="#how-it-works" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors duration-200">
              <HelpCircle className="w-4 h-4" /> How It Works
            </a>
          </div>

          {/* Right side: theme + CTA + hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} size="sm" />
            <AnimatedCTAButton
              to="/login"
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex px-3 sm:px-4 gap-1.5"
              trailingIcon={<Rocket className="w-4 h-4" />}
            >
              Get Started
            </AnimatedCTAButton>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-border/50"
            >
              <div className="container flex flex-col gap-1 py-3">
                <a href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors">
                  <Home className="w-4 h-4 text-primary" /> Home
                </a>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors">
                  <Sparkles className="w-4 h-4 text-primary" /> Features
                </a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors">
                  <HelpCircle className="w-4 h-4 text-primary" /> How It Works
                </a>
                <div className="sm:hidden pt-2">
                  <AnimatedCTAButton
                    to="/login"
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    trailingIcon={<Rocket className="w-4 h-4" />}
                  >
                    Get Started
                  </AnimatedCTAButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-22 dark:opacity-30">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/90 to-background dark:from-background/50 dark:via-background/80 dark:to-background" />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div initial="hidden" animate="visible">
              <motion.div
                variants={fadeInUp}
                custom={0}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 mb-5 sm:mb-8 text-[11px] sm:text-xs font-medium rounded-full border border-primary/50 bg-primary/20 text-primary dark:text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-sm"
              >
                <Zap className="w-3 h-3 text-primary" /> Real-time Collaboration
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                custom={1}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold leading-[1.12] mb-4 sm:mb-6 dark:text-white"
                style={{ color: isDark ? undefined : "hsl(239, 40%, 25%)" }}
              >
                Where Great
                <br />
                <span className="inline-flex items-end min-w-[6ch] sm:min-w-[8ch] md:min-w-[10ch]">
                  <span className="text-gradient capitalize">{displayText}</span>
                  <motion.span
                    aria-hidden
                    className="ml-0.5 sm:ml-1 inline-block w-[2px] md:w-[3px] h-[0.8em] sm:h-[0.85em] md:h-[0.9em] rounded-full bg-primary"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                  />
                </span>
                <br />
                Get{" "}
                <span className="animate-text-shimmer inline-block">hired</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                custom={2}
                className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mb-5 sm:mb-6 md:mb-8"
              >
                A collaborative space for technical interviews — real-time code
                editor, shared whiteboard, HD video, and AI-powered hints. All
                in one.
              </motion.p>

              {/* Feature Badges */}
              <motion.div
                variants={fadeInUp}
                custom={2.5}
                className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5 sm:mb-8"
              >
                {[
                  { icon: Video, label: "Live Video Chat" },
                  { icon: Code2, label: "Code Editor" },
                  { icon: PenLine, label: "Whiteboard" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/30 bg-primary/10 text-xs sm:text-sm text-foreground backdrop-blur-sm"
                  >
                    <badge.icon className="w-3.5 h-3.5 text-primary" />
                    {badge.label}
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                custom={3}
                className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4"
              >
                <AnimatedCTAButton
                  to="/login"
                  variant="primary"
                  size="lg"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  }
                  trailingIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Interview
                </AnimatedCTAButton>
                <AnimatedCTAButton
                  to="/login"
                  variant="outline"
                  size="lg"
                >
                  View Demo
                </AnimatedCTAButton>
              </motion.div>

              {/* Stats Bar */}
              <motion.div
                variants={fadeInUp}
                custom={4}
                className="flex flex-wrap items-center gap-4 sm:gap-8 mt-8 lg:mt-10 pt-5 lg:pt-6 border-t border-border/50"
              >
                {[
                  {
                    label: "Active Users",
                    render: <CountUpValue end={10} suffix="K+" />,
                  },
                  {
                    label: "Sessions",
                    render: <CountUpValue end={50} suffix="K+" />,
                  },
                  {
                    label: "Uptime",
                    render: <CountUpValue end={99.9} decimals={1} suffix="%" />,
                  },
                ].map((stat, idx) => (
                  <div key={stat.label} className="flex items-center gap-4 sm:gap-8">
                    <div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-gradient">
                        {stat.render}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stat.label}
                      </div>
                    </div>
                    {idx < 2 && (
                      <div className="w-px h-10 bg-border/50 hidden sm:block" />
                    )}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="relative w-full max-w-lg">
                <div className="relative z-10">
                  {/* Glow behind image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent rounded-3xl blur-3xl" />

                  {/* Interview Image (static, no animation) */}
                  <img
                    src={heroInterview}
                    alt="Interview illustration"
                    className="w-full h-auto drop-shadow-2xl relative z-10"
                  />

                  {/* === Animated Q&A Speech Bubbles === */}

                  {/* Q1 — Above interviewer (top-left) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0, 1, 1, 1, 0], y: [10, 0, 0, 0, -4] }}
                    transition={{
                      repeat: Infinity,
                      repeatDelay: 14,
                      duration: 7,
                      ease: "easeOut",
                      times: [0, 0.1, 0.4, 0.85, 1],
                    }}
                    className="absolute top-[-8%] left-[2%] z-20 max-w-[160px]"
                  >
                    <div className="bg-indigo-600 text-white text-[11px] leading-snug px-3.5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                      What is a closure in JavaScript?
                    </div>
                    <div className="w-0 h-0 ml-4 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-indigo-600" />
                  </motion.div>

                  {/* A1 — Above candidate (top-right) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: [0, 0, 1, 1, 1, 0],
                      y: [10, 10, 0, 0, 0, -4],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatDelay: 14,
                      duration: 7,
                      ease: "easeOut",
                      times: [0, 0.18, 0.28, 0.5, 0.85, 1],
                    }}
                    className="absolute top-[-5%] right-[2%] z-20 max-w-[170px]"
                  >
                    <div className="bg-emerald-600 text-white text-[11px] leading-snug px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30">
                      It's a function that remembers variables from its outer
                      scope even after that function returns.
                    </div>
                    <div className="w-0 h-0 ml-auto mr-4 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-emerald-600" />
                  </motion.div>

                  {/* Q2 — Above interviewer */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0, 1, 1, 1, 0], y: [10, 0, 0, 0, -4] }}
                    transition={{
                      repeat: Infinity,
                      repeatDelay: 14,
                      duration: 7,
                      delay: 7,
                      ease: "easeOut",
                      times: [0, 0.1, 0.4, 0.85, 1],
                    }}
                    className="absolute top-[-8%] left-[2%] z-20 max-w-[160px]"
                  >
                    <div className="bg-purple-600 text-white text-[11px] leading-snug px-3.5 py-2.5 rounded-xl shadow-lg shadow-purple-500/30">
                      Difference between == and === ?
                    </div>
                    <div className="w-0 h-0 ml-4 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-purple-600" />
                  </motion.div>

                  {/* A2 — Above candidate */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: [0, 0, 1, 1, 1, 0],
                      y: [10, 10, 0, 0, 0, -4],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatDelay: 14,
                      duration: 7,
                      delay: 7,
                      ease: "easeOut",
                      times: [0, 0.18, 0.28, 0.5, 0.85, 1],
                    }}
                    className="absolute top-[-5%] right-[2%] z-20 max-w-[170px]"
                  >
                    <div className="bg-teal-600 text-white text-[11px] leading-snug px-3.5 py-2.5 rounded-xl shadow-lg shadow-teal-500/30">
                      == does type coercion, === checks both value and type
                      strictly.
                    </div>
                    <div className="w-0 h-0 ml-auto mr-4 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-teal-600" />
                  </motion.div>

                  {/* Q3 — Above interviewer */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0, 1, 1, 1, 0], y: [10, 0, 0, 0, -4] }}
                    transition={{
                      repeat: Infinity,
                      repeatDelay: 14,
                      duration: 7,
                      delay: 14,
                      ease: "easeOut",
                      times: [0, 0.1, 0.4, 0.85, 1],
                    }}
                    className="absolute top-[-8%] left-[2%] z-20 max-w-[160px]"
                  >
                    <div className="bg-indigo-600 text-white text-[11px] leading-snug px-3.5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                      Time complexity of binary search?
                    </div>
                    <div className="w-0 h-0 ml-4 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-indigo-600" />
                  </motion.div>

                  {/* A3 — Above candidate */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: [0, 0, 1, 1, 1, 0],
                      y: [10, 10, 0, 0, 0, -4],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatDelay: 14,
                      duration: 7,
                      delay: 14,
                      ease: "easeOut",
                      times: [0, 0.18, 0.28, 0.5, 0.85, 1],
                    }}
                    className="absolute top-[-5%] right-[2%] z-20 max-w-[170px]"
                  >
                    <div className="bg-emerald-600 text-white text-[11px] leading-snug px-3.5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30">
                      O(log n) — it halves the search space with each step.
                    </div>
                    <div className="w-0 h-0 ml-auto mr-4 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-emerald-600" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Room Preview */}
      <section className="py-8 sm:py-12">
        <div className="container">
          <MotionWrapper
            variants={fadeInUp}
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-xl border border-border overflow-hidden shadow-card"
          >
            <div className="bg-card p-1">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <div className="w-3 h-3 rounded-full bg-destructive/70" />
                <div className="w-3 h-3 rounded-full bg-warning/70" />
                <div className="w-3 h-3 rounded-full bg-success/70" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">
                  interview-room — InterviewOS
                </span>
              </div>
              <div className="bg-background rounded-lg p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2 sm:gap-3 min-h-[200px] md:min-h-[350px]">
                {/* Video panel mock */}
                <div className="sm:col-span-1 md:col-span-3 space-y-2 sm:space-y-3">
                  <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Users className="w-8 h-8 text-muted-foreground" />
                    </motion.div>
                  </div>
                  <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        repeat: Infinity,
                        duration: 4,
                        ease: "linear",
                      }}
                    >
                      <Video className="w-8 h-8 text-muted-foreground" />
                    </motion.div>
                  </div>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => setIsMicOn(!isMicOn)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isMicOn
                          ? "bg-secondary hover:bg-surface-hover text-foreground"
                          : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      }`}
                    >
                      {isMicOn ? (
                        <Mic className="w-4 h-4" />
                      ) : (
                        <MicOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isVideoOn
                          ? "bg-secondary hover:bg-surface-hover text-foreground"
                          : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      }`}
                    >
                      {isVideoOn ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <VideoOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsScreenShareOn(!isScreenShareOn)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isScreenShareOn
                          ? "bg-secondary hover:bg-surface-hover text-foreground"
                          : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      }`}
                    >
                      {isScreenShareOn ? (
                        <Monitor className="w-4 h-4" />
                      ) : (
                        <MonitorOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsCallActive(!isCallActive)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isCallActive
                          ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                          : "bg-success text-success-foreground hover:bg-success/90"
                      }`}
                    >
                      {isCallActive ? (
                        <PhoneOff className="w-4 h-4" />
                      ) : (
                        <Phone className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Editor mock */}
                <div className="sm:col-span-1 md:col-span-6 rounded-lg bg-card border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="text-xs text-muted-foreground font-mono">
                      solution.ts
                    </span>
                    <div className="flex gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary">
                        TypeScript
                      </span>
                    </div>
                  </div>
                  <div className="p-3 font-mono text-xs leading-relaxed text-foreground">
                    {previewCodeLines.map((line, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, width: 0 }}
                        whileInView={{ opacity: 1, width: "100%" }}
                        viewport={{ once: true }}
                        transition={{
                          delay: idx * 0.5,
                          duration: 0.5,
                          ease: "linear",
                        }}
                        className={
                          `overflow-hidden whitespace-nowrap ` +
                          (idx === activeLine
                            ? "border-r-2 border-transparent animate-blink-caret"
                            : "")
                        }
                        style={{ maxWidth: "fit-content" }}
                      >
                        <pre className="m-0 whitespace-pre text-[13px] font-[JetBrains\ Mono],monospace">
                          {line}
                        </pre>
                      </motion.div>
                    ))}
                  </div>
                </div>
                {/* Chat mock */}
                <div className="sm:col-span-2 md:col-span-3 rounded-lg bg-card border border-border flex flex-col">
                  <div className="px-3 py-2 border-b border-border">
                    <span className="text-xs font-medium text-foreground">
                      Chat
                    </span>
                  </div>
                  <div className="flex-1 p-4 space-y-4 overflow-hidden flex flex-col h-full justify-end">
                    <LayoutGroup>
                      {previewChatLines.map((msg, i) => {
                        const startStep = i * 2 + 1;
                        const isVisible = currentChatStep >= startStep;
                        const isTyping = currentChatStep === startStep;
                        const isTextVisible = currentChatStep > startStep;
                        const isAlex = msg.sender === "Alex";

                        if (!isVisible) return null;

                        return (
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={i}
                            className={`flex w-full ${isAlex ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`
                                flex flex-col max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
                                ${
                                  isAlex
                                    ? "bg-secondary text-secondary-foreground rounded-tl-sm"
                                    : "bg-primary text-primary-foreground rounded-tr-sm"
                                }
                              `}
                            >
                              <span className="text-xs font-semibold mb-1 opacity-70">
                                {msg.sender}
                              </span>

                              <div className="min-h-[20px] relative">
                                <AnimatePresence mode="wait">
                                  {isTyping && (
                                    <motion.div
                                      key="typing"
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{
                                        opacity: 0,
                                        scale: 0.95,
                                        transition: { duration: 0.15 },
                                      }}
                                      className="flex gap-1 h-5 items-center"
                                    >
                                      <div
                                        className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] ${isAlex ? "bg-foreground/50" : "bg-white/50"}`}
                                      />
                                      <div
                                        className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] ${isAlex ? "bg-foreground/50" : "bg-white/50"}`}
                                      />
                                      <div
                                        className={`w-1.5 h-1.5 rounded-full animate-bounce ${isAlex ? "bg-foreground/50" : "bg-white/50"}`}
                                      />
                                    </motion.div>
                                  )}
                                  {isTextVisible && (
                                    <motion.p
                                      key="text"
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.3,
                                        ease: "easeOut",
                                      }}
                                      className="text-sm leading-relaxed"
                                    >
                                      {msg.text}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </LayoutGroup>
                  </div>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 sm:py-16 md:py-20">
        <div className="container">
          <motion.div
            variants={fadeInUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-3 sm:mb-4 dark:text-white"
              style={{ color: isDark ? undefined : "hsl(239, 40%, 25%)" }}
            >
              Everything you need to
              <span className="animate-text-shimmer"> run interviews</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              From live coding to AI-powered feedback, InterviewOS handles the
              entire interview lifecycle.
            </p>
          </motion.div>

          <div className="space-y-16 sm:space-y-20 md:space-y-28">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className={`grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center ${
                  i % 2 === 1 ? "md:direction-rtl" : ""
                }`}
              >
                {/* Text content */}
                <div className={`space-y-5 ${i % 2 === 1 ? "md:order-2" : ""}`}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <feature.icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold tracking-wider text-primary">{feature.badge}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold dark:text-white"
                    style={{ color: isDark ? undefined : "hsl(239, 40%, 25%)" }}
                  >
                    {feature.headline}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {feature.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                  <a href="#" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors pt-2 group/link">
                    Learn more
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>

                {/* Preview mockup */}
                <div className={`${i % 2 === 1 ? "md:order-1" : ""}`}>
                  {renderFeaturePreview(feature.previewType)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-card/50">
        <div className="container">
          <MotionWrapper
            variants={fadeInUp}
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-3 sm:mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              Three steps to a better interview experience.
            </p>
          </MotionWrapper>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Schedule",
                desc: "Create an interview room, set the tech stack and difficulty, and invite your candidate via email.",
              },
              {
                step: "02",
                title: "Interview",
                desc: "Collaborate in real-time with live code editing, video calling, and AI-powered assistance.",
              },
              {
                step: "03",
                title: "Evaluate",
                desc: "Submit structured feedback with rubric ratings and share insights with your candidate.",
              },
            ].map((item, i) => (
              <MotionWrapper
                key={item.step}
                variants={fadeInUp}
                custom={i}
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl font-display font-bold text-gradient mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials slider */}
      <section className="py-8 sm:py-12 bg-card/50">
        <div
          ref={testimonialsRef}
          className="container relative overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 5%, rgba(0,0,0,0.5) 12%, black 18%, black 82%, rgba(0,0,0,0.5) 88%, rgba(0,0,0,0.1) 95%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 5%, rgba(0,0,0,0.5) 12%, black 18%, black 82%, rgba(0,0,0,0.5) 88%, rgba(0,0,0,0.1) 95%, transparent 100%)",
            backdropFilter: "blur(0.5px)",
          }}
        >
          <MotionWrapper
            variants={fadeInUp}
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              What People Are Saying
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Hear from our users about their experience.
            </p>
          </MotionWrapper>

          <div
            onClick={() =>
              handleMarqueePause("testimonials", setTestimonialsPaused)
            }
            className={`flex gap-6 pb-4 w-max cursor-pointer ${
              testimonialsInView
                ? "animate-[marquee-left_90s_linear_infinite]"
                : ""
            }`}
            style={{
              animationPlayState: testimonialsPaused ? "paused" : "running",
            }}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className={`w-80 flex-shrink-0 p-5 rounded-xl border shadow-lg transition-all hover:scale-[1.02] ${
                  t.platform === "linkedin"
                    ? "bg-card border-blue-500/20"
                    : t.platform === "twitter"
                      ? "bg-card border-sky-400/20"
                      : "bg-card border-orange-500/20"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const fallback =
                          target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                      className={`w-10 h-10 rounded-full object-cover ring-2 ${
                        t.platform === "linkedin"
                          ? "ring-blue-500/50"
                          : t.platform === "twitter"
                            ? "ring-sky-400/50"
                            : "ring-orange-500/50"
                      }`}
                    />
                    <div
                      style={{ display: "none" }}
                      className={`w-10 h-10 rounded-full items-center justify-center text-white text-sm font-bold ring-2 ${
                        t.platform === "linkedin"
                          ? "bg-blue-600 ring-blue-500/50"
                          : t.platform === "twitter"
                            ? "bg-sky-500 ring-sky-400/50"
                            : "bg-orange-500 ring-orange-500/50"
                      }`}
                    >
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        {t.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.role ? t.role : t.handle}
                      </div>
                    </div>
                  </div>
                  {/* Platform icon */}
                  {t.platform === "linkedin" && (
                    <svg
                      className="w-5 h-5 text-blue-600 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  )}
                  {t.platform === "twitter" && (
                    <svg
                      className="w-5 h-5 text-foreground flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {t.platform === "reddit" && (
                    <svg
                      className="w-5 h-5 text-orange-500 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                  {t.text}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1">
                    {t.platform === "reddit" ? (
                      <>
                        <svg
                          className="w-3.5 h-3.5 text-orange-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
                            transform="rotate(-90 12 12)"
                          />
                        </svg>
                        <span>{t.likes}</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span>{t.likes}</span>
                      </>
                    )}
                  </div>
                  <span>{t.time} ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner logos grid */}
      <section className="py-10 sm:py-14 md:py-20 bg-gradient-to-b from-card/30 via-card/60 to-card/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-6 sm:mb-8 md:mb-10"
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
              Trusted by Top Companies & Colleges
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-lg mx-auto">
              Leading organizations and institutions rely on{" "}
              <span className="text-foreground">Interview</span>
              <span className="text-primary font-semibold">OS</span> for
              seamless technical hiring.
            </p>
          </motion.div>

          {/* Row 1: Companies */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 md:gap-x-16 gap-y-6 sm:gap-y-8 mb-8 sm:mb-10"
          >
            {partnerLogos
              .filter((l) => !["MSU Baroda", "LDCE", "Parul University", "GTU"].includes(l.alt))
              .map((logo) => (
                <div
                  key={logo.alt}
                  className="flex items-center justify-center"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="h-12 sm:h-16 md:h-20 w-auto object-contain"
                  />
                </div>
              ))}
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8 sm:mb-10 max-w-xl mx-auto">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Universities
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* Row 2: Colleges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 md:gap-x-16 gap-y-6 sm:gap-y-8"
          >
            {partnerLogos
              .filter((l) => ["MSU Baroda", "LDCE", "Parul University", "GTU"].includes(l.alt))
              .map((logo) => (
                <div
                  key={logo.alt}
                  className="flex items-center justify-center"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className={logo.alt === "GTU" ? "h-24 sm:h-32 md:h-40 w-auto object-contain" : "h-16 sm:h-20 md:h-24 w-auto object-contain"}
                  />
                </div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-12 md:py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center p-6 sm:p-8 md:p-12 rounded-[20px] sm:rounded-[28px] bg-gradient-to-br from-primary via-indigo-500/90 to-purple-600/95 shadow-[0_22px_60px_rgba(67,56,202,0.28)] ring-1 ring-white/15 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(67,56,202,0.32)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                Revolutionize your hiring process in minutes
              </h2>
              <p className="text-primary-foreground/80 mb-6 sm:mb-8 text-base sm:text-lg">
                Collaborate, evaluate and onboard faster with InterviewOS—build
                stronger engineering teams with confidence.
              </p>
              <AnimatedCTAButton
                to="/login"
                variant="secondary"
                size="lg"
                trailingIcon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started Free
              </AnimatedCTAButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container">
          <MotionWrapper
            variants={fadeInUp}
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </MotionWrapper>

          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
            {/* Category tabs - left side */}
            <div className="flex flex-row lg:flex-col flex-wrap gap-1.5 sm:gap-2 lg:w-72 shrink-0 overflow-x-auto pb-2 lg:pb-0">
              {faqCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-3 rounded-full text-sm font-medium text-left transition-all border ${
                    activeCategory === cat
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/30 shadow-sm dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-400/30"
                      : "bg-card text-foreground border-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ accordion - right side */}
            <div className="flex-1 min-w-0">
              <div className="border border-border/60 rounded-xl bg-card overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  {(faqData[activeCategory] || []).map((faq, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`faq-${idx}`}
                      className="border-b border-border/40 last:border-b-0 px-5"
                    >
                      <AccordionTrigger className="text-left text-foreground hover:no-underline py-5 text-base font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border mt-4 sm:mt-6 md:mt-8">
        <div className="container py-4 sm:py-5">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4">
            {/* Logo */}
            <a href="/">
              <img
                src={isDark ? logo : logoLight}
                alt="InterviewOS Logo"
                className="w-40 sm:w-60 h-12 sm:h-16 object-contain"
              />
            </a>

            {/* Copyright */}
            <div className="flex-1 text-center text-xs text-muted-foreground italic mt-2 sm:mt-4 order-last lg:order-none w-full lg:w-auto">
              © 2026 InterviewOS. All rights reserved.
              <span className="block">Made with ❤️ by Bharat Dhuva.</span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white hover:scale-110 transition-transform"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-foreground text-background hover:scale-110 transition-transform"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-600 text-white hover:scale-110 transition-transform"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-red-600 text-white hover:scale-110 transition-transform"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
