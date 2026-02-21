import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Code2,
  Video,
  MessageSquare,
  Brain,
  Shield,
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
} from "lucide-react";
import { MotionWrapper } from "@/components/MotionWrapper";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";
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

// logos for companies/colleges using InterviewOS
// ...existing code...

const previewChatLines = [
  { sender: "Alex", text: "Can you walk me through your approach?" },
  { sender: "Jordan", text: "Sure! I'm using a hash map for O(n) lookup..." },
  { sender: "Alex", text: "Great! What about edge cases?" },
];

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
  const [partnersPaused, setPartnersPaused] = useState(false);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.2 });
  const partnersInView = useInView(partnersRef, { once: true, amount: 0.2 });
  const pauseTimeouts = useRef<{
    testimonials?: ReturnType<typeof setTimeout>;
    partners?: ReturnType<typeof setTimeout>;
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
      if (pauseTimeouts.current.partners) {
        clearTimeout(pauseTimeouts.current.partners);
      }
    };
  }, []);

  const handleMarqueePause = (
    key: "testimonials" | "partners",
    setPaused: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setPaused(true);
    if (pauseTimeouts.current[key]) {
      clearTimeout(pauseTimeouts.current[key]);
    }
    pauseTimeouts.current[key] = setTimeout(() => {
      setPaused(false);
    }, 1500);
  };

  const [currentChatStep, setCurrentChatStep] = useState(0);

  // Rotating hero words - typewriter effect
  const heroWords = [
    "engineers",
    "developers",
    "designers",
    "innovators",
    "creators",
    "builders",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container relative flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <img
              src={isDark ? logo : logoLight}
              alt="InterviewOS Logo"
              className="w-72 h-20 object-contain"
            />
          </a>
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-12">
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
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border bg-card hover:bg-surface-hover transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </button>
            <Button
              asChild
              className="group rounded-full bg-gradient-primary hover:opacity-90 transition-all duration-300 text-base px-8 h-12 font-semibold relative overflow-hidden"
            >
              <Link to="/login" className="flex items-center gap-2">
                Get Started
                <Rocket className="w-5 h-5 origin-[100%_0]" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-22 dark:opacity-30">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/90 to-background dark:from-background/50 dark:via-background/80 dark:to-background" />

        <div className="container relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeInUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-medium rounded-full border border-primary/50 bg-primary/20 text-primary dark:text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-sm"
            >
              <Star className="w-3 h-3 text-primary" /> Built for engineering
              interviews
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-5xl md:text-7xl font-display font-bold leading-[1.1] mb-6 dark:text-white"
              style={{ color: isDark ? undefined : "hsl(239, 40%, 25%)" }}
            >
              Where great{" "}
              <span className="text-gradient">
                {displayText}
                <span
                  className="inline-block w-[3px] h-[0.85em] ml-1 align-middle rounded-sm"
                  style={{
                    background: "linear-gradient(to bottom, #a855f7, #6366f1)",
                    animation: "blink 1s step-end infinite",
                  }}
                />
              </span>
              <br />
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
              <Button
                size="lg"
                asChild
                className="group rounded-full bg-gradient-primary hover:opacity-90 transition-all duration-300 text-base px-8 h-12 font-semibold relative overflow-hidden"
              >
                <Link to="/login" className="flex items-center gap-3">
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
      <section className="py-12">
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
                <div className="col-span-6 rounded-lg bg-card border border-border overflow-hidden">
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
            <h2
              className="text-3xl md:text-5xl font-display font-bold mb-4 dark:text-white"
              style={{ color: isDark ? undefined : "hsl(239, 40%, 25%)" }}
            >
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
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(99,102,241,0.2),0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-2 cursor-pointer"
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

      {/* Testimonials slider */}
      <section className="py-12 bg-card/50">
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
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              What People Are Saying
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Hear from our users about their experience.
            </p>
          </MotionWrapper>

          <div
            onClick={() => handleMarqueePause("testimonials", setTestimonialsPaused)}
            className={`flex gap-6 pb-4 w-max cursor-pointer ${
              testimonialsInView ? "animate-[marquee-left_90s_linear_infinite]" : ""
            }`}
            style={{ animationPlayState: testimonialsPaused ? "paused" : "running" }}
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

      {/* Partner logos marquee */}
      <motion.section
        className="py-20 bg-gradient-to-b from-card/30 via-card/60 to-card/30"
        initial={{ opacity: 0, x: -25 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        <div className="container relative overflow-hidden">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Trusted by Top Companies & Colleges
            </h3>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Leading organizations and institutions rely on{" "}
              <span className="text-foreground">Interview</span>
              <span className="text-primary font-semibold">OS</span> for
              seamless technical hiring.
            </p>
          </div>
          <div
            ref={partnersRef}
            className="relative overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            }}
          >
            <div
              onClick={() => handleMarqueePause("partners", setPartnersPaused)}
              className={`flex items-center gap-6 w-max cursor-pointer ${
                partnersInView ? "animate-[marquee-right_100s_linear_infinite]" : ""
              }`}
              style={{ animationPlayState: partnersPaused ? "paused" : "running" }}
            >
              {[
                ...partnerLogos,
                ...partnerLogos,
                ...partnerLogos,
                ...partnerLogos,
              ].map((logo, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 flex items-center justify-center h-72 w-56 px-2"
                >
                  {logo.alt === "Parul University" || logo.alt === "GTU" ? (
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="max-h-80 object-contain"
                    />
                  ) : logo.alt === "MSU Baroda" || logo.alt === "LDCE" ? (
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="max-h-32 object-contain"
                    />
                  ) : logo.alt === "Accenture" ? (
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="max-h-32 object-contain"
                    />
                  ) : logo.alt === "Oracle" ? (
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="max-h-80 object-contain"
                    />
                  ) : (
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="max-h-68 object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center p-12 rounded-[28px] bg-gradient-to-br from-primary via-indigo-500/90 to-purple-600/95 shadow-[0_22px_60px_rgba(67,56,202,0.28)] ring-1 ring-white/15 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(67,56,202,0.32)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                Revolutionize your hiring process in minutes
              </h2>
              <p className="text-primary-foreground/80 mb-8 text-lg">
                Collaborate, evaluate and onboard faster with InterviewOS—build
                stronger engineering teams with confidence.
              </p>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="text-base px-8 h-12"
              >
                <Link to="/login">
                  Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <MotionWrapper
            variants={fadeInUp}
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </MotionWrapper>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Category tabs - left side */}
            <div className="flex flex-row lg:flex-col flex-wrap gap-2 lg:w-72 shrink-0">
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
      <footer className="bg-card/50 border-t border-border mt-8">
        <div className="container py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Logo */}
            <a href="/">
              <img
                src={isDark ? logo : logoLight}
                alt="InterviewOS Logo"
                className="w-60 h-16 object-contain"
              />
            </a>

            {/* Copyright */}
            <div className="flex-1 text-center text-xs text-muted-foreground italic mt-4">
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
