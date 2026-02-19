import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Code2,
  Video,
  MessageSquare,
  Brain,
  Shield,
  Zap,
  ArrowRight,
  Terminal,
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
} from "lucide-react";
import { MotionWrapper, fadeInUp } from "@/components/MotionWrapper";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

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

const features = [
  {
    icon: Code2,
    title: "Live Code Editor",
    description:
      "Monaco-powered collaborative editor with real-time cursor presence and 7+ languages.",
  },
  {
    icon: Video,
    title: "WebRTC Video",
    description:
      "Peer-to-peer HD video calling with screen share and connection quality monitoring.",
  },
  {
    icon: Brain,
    title: "AI Assistant",
    description:
      "GPT-4o powered hints, code review, and post-interview analysis.",
  },
  {
    icon: MessageSquare,
    title: "In-Room Chat",
    description:
      "Real-time messaging with typing indicators and message history.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "JWT dual-token auth, RBAC, rate limiting, and input sanitization.",
  },
  {
    icon: Zap,
    title: "Code Execution",
    description:
      "Sandboxed execution via Judge0 with stdout, stderr, and performance metrics.",
  },
];

const stats = [
  { value: "7+", label: "Languages" },
  { value: "<100ms", label: "Sync Latency" },
  { value: "P2P", label: "Video Calls" },
  { value: "AI", label: "Powered" },
];

const previewChatLines = [
  { sender: "Alex", text: "Can you walk me through your approach?" },
  { sender: "Jordan", text: "Sure! I'm using a hash map for O(n) lookup..." },
  { sender: "Alex", text: "Great! What about edge cases?" },
];

export default function LandingPage() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenShareOn, setIsScreenShareOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(true);

  const [currentChatStep, setCurrentChatStep] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const runLoop = () => {
      setCurrentChatStep((prev) => {
        const totalSteps = previewChatLines.length * 2;
        // Loop: 0 -> 1(Msg0 Type) -> 2(Msg0 Text) -> 3(Msg1 Type) -> 4(Msg1 Text)... -> End -> 0
        const next = (prev + 1) % (totalSteps + 2); 
        
        let delay = 1000;
        if (next === 0) {
            delay = 500; // Restart
        } else if (next > totalSteps) {
           delay = 3000; // End pause
        } else if (next % 2 === 1) {
           // Typing step (1, 3, 5). Duration of typing.
           delay = 1500;
        } else {
           // Text revealed step (2, 4, 6). Duration of reading.
           delay = 3000;
        }
        
        timeout = setTimeout(runLoop, delay);
        return next;
      });
    };
    
    timeout = setTimeout(runLoop, 1000);
    return () => clearTimeout(timeout);
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



  const testimonials = [
    {
      name: "Shubham Tandon",
      text: "This platform transformed our hiring process. The real-time coding and AI feedback are amazing!",
    },
    {
      name: "Rohit Sharma",
      text: "We cut interview time in half and improved candidate experience with the live editor.",
    },
    {
      name: "Anusha Jha",
      text: "The user interface is sleek and the animated previews are a delightful touch.",
    },
    {
      name: "Priya Kapoor",
      text: "InterviewOS saved us hours every week – the video and code sync are flawless.",
    },
    {
      name: "Vikram Patel",
      text: "Candidates love the smooth experience; hiring has never easier.",
    },
    {
      name: "Meena Kumari",
      text: "The infinite scrolling testimonials on the landing page look so professional!",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary">
              <Terminal className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-display font-bold text-foreground">
              InterviewOS
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-12">
            <a
              href="/"
              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              Home
            </a>
            <a
              href="#features"
              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors duration-200"
            >
              <Sparkles className="w-4 h-4" />
              Features
            </a>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors duration-200"
            >
              <HelpCircle className="w-4 h-4" />
              How It Works
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

        <div className="container relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeInUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-medium rounded-full border border-primary/50 bg-primary/20 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-sm">
              <Star className="w-3 h-3 text-primary" /> Built for engineering interviews
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-5xl md:text-7xl font-display font-bold leading-[1.1] mb-6"
            >
              Where great
              <span className="text-gradient"> engineers </span>
              get hired
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              The all-in-one interview platform with live coding, WebRTC video,
              AI-powered assistance, and structured feedback — built for teams
              that take hiring seriously.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" asChild className="group rounded-full bg-gradient-primary hover:opacity-90 transition-all duration-300 text-base px-8 h-12 font-semibold relative overflow-hidden">
                <Link to="/register" className="flex items-center gap-3">
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
                    className="transition-transform duration-300 group-hover:animate-[ring_0.5s_ease-in-out_infinite]"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="pb-[1px]">Start Interview</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full text-base px-10 h-12 border border-foreground/20 hover:bg-secondary/50 transition-all duration-200 font-semibold"
              >
                <Link to="/login">View Demo</Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              custom={4}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-2xl mx-auto"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-display font-bold text-gradient">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Room Preview */}
      <section className="py-16">
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
              <div className="bg-background rounded-lg p-4 grid grid-cols-12 gap-3 min-h-[350px]">
                {/* Video panel mock */}
                <div className="col-span-3 space-y-3">
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
                      {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isVideoOn
                          ? "bg-secondary hover:bg-surface-hover text-foreground"
                          : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      }`}
                    >
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsScreenShareOn(!isScreenShareOn)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isScreenShareOn
                          ? "bg-secondary hover:bg-surface-hover text-foreground"
                          : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      }`}
                    >
                      {isScreenShareOn ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsCallActive(!isCallActive)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isCallActive
                          ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                          : "bg-success text-success-foreground hover:bg-success/90"
                      }`}
                    >
                      {isCallActive ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {/* Editor mock */}
                <div className="col-span-6 rounded-lg bg-[hsl(0,0%,8%)] border border-border overflow-hidden">
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
                  <div className="p-3 font-mono text-xs leading-relaxed">
                    {previewCodeLines.map((line, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, width: 0 }}
                        whileInView={{ opacity: 1, width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ 
                          delay: idx * 0.5, 
                          duration: 0.5, 
                          ease: "linear" 
                        }}
                        className="overflow-hidden whitespace-nowrap border-r-2 border-transparent animate-blink-caret"
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
                <div className="col-span-3 rounded-lg bg-card border border-border flex flex-col">
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
                            className={`flex w-full ${isAlex ? 'justify-start' : 'justify-end'}`}
                          >
                            <div 
                              className={`
                                flex flex-col max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
                                ${isAlex 
                                  ? 'bg-secondary text-secondary-foreground rounded-tl-sm' 
                                  : 'bg-primary text-primary-foreground rounded-tr-sm'
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
                                       exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                                       className="flex gap-1 h-5 items-center"
                                     >
                                       <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] ${isAlex ? 'bg-foreground/50' : 'bg-white/50'}`} />
                                       <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] ${isAlex ? 'bg-foreground/50' : 'bg-white/50'}`} />
                                       <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isAlex ? 'bg-foreground/50' : 'bg-white/50'}`} />
                                     </motion.div>
                                  )}
                                  {isTextVisible && (
                                    <motion.p
                                      key="text"
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3, ease: "easeOut" }}
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
      <section id="features" className="py-20">
        <div className="container">
          <motion.div
            variants={fadeInUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Everything you need to
              <span className="animate-text-shimmer"> run interviews</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From live coding to AI-powered feedback, InterviewOS handles the
              entire interview lifecycle.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <MotionWrapper
                key={feature.title}
                variants={fadeInUp}
                custom={i}
                whileInView="visible"
                viewport={{ once: true }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-glow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-card/50">
        <div className="container">
          <MotionWrapper
            variants={fadeInUp}
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg">
              Three steps to a better interview experience.
            </p>
          </MotionWrapper>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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

      {/* Testimonials slider – automatic looping with left‑edge fade */}
      <section className="py-12 bg-card/50">
        <div
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
            className="mb-8 text-center"
          >
            <h3 className="text-xl font-semibold">What people are saying</h3>
          </MotionWrapper>

          <motion.div
            className="flex gap-6 pb-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="w-72 flex-shrink-0 p-6 bg-card rounded-lg border border-border shadow-lg"
              >
                <div className="font-semibold mb-1">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.text}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center p-12 rounded-2xl bg-gradient-primary relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                Ready to transform your interviews?
              </h2>
              <p className="text-primary-foreground/80 mb-8 text-lg">
                Join engineering teams who hire smarter with InterviewOS.
              </p>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-base px-8 h-12"
              >
                <Link to="/register">
                  Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-primary">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">
              InterviewOS
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 InterviewOS. Built by Bharat Dhuva.
          </p>
        </div>
      </footer>
    </div>
  );
}
