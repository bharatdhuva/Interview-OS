import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Brain,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  PhoneOff,
  Play,
  Save,
  Send,
  Clock,
  Terminal,
  Users,
  PenTool,
  Code2,
  Maximize2,
  ShieldCheck,
  ShieldAlert,
  Wifi,
  WifiOff,
  Gauge,
  X,
  ChevronDown,
  Copy,
  VolumeX,
  Lock,
  Unlock,
  MessageSquare,
  FileText,
  ClipboardList,
  Settings,
  Share2,
  Mail,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { useProctor } from "@/hooks/useProctor";
import api from "@/lib/api";
import { io } from "socket.io-client";

// Lazy-loaded components for code-splitting
const EditorTabPanel = React.lazy(() => import("@/components/room/EditorTabPanel"));
const WhiteboardPanel = React.lazy(() => import("@/components/room/WhiteboardPanel"));
const ProblemTabPanel = React.lazy(() => import("@/components/room/ProblemTabPanel"));

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const questionTemplates = [
  {
    title: "Two Sum",
    markdown: `# Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.

You can return the answer in any order.

### Example 1:
**Input:** nums = [2,7,11,15], target = 9
**Output:** [0,1]
**Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].

### Example 2:
**Input:** nums = [3,2,4], target = 6
**Output:** [1,2]

### Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
`
  },
  {
    title: "Valid Parentheses",
    markdown: `# Valid Parentheses

Given a string \`s\` containing just the characters \`'\('\`, \`'\)'\`, \`'\{'\`, \`'\}'\`, \`'\['\` and \`'\]'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Example 1:
**Input:** s = "()"
**Output:** true

### Example 2:
**Input:** s = "()[]{}"
**Output:** true

### Constraints:
- 1 <= s.length <= 10^4
- \`s\` consists of parentheses only \`'()[]{}'\`.
`
  },
  {
    title: "Merge Intervals",
    markdown: `# Merge Intervals

Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.

### Example 1:
**Input:** intervals = [[1,3],[2,6],[8,10],[15,18]]
**Output:** [[1,6],[8,10],[15,18]]
**Explanation:** Since intervals [1,3] and [2,6] overlap, merge them into [1,6].

### Example 2:
**Input:** intervals = [[1,4],[4,5]]
**Output:** [[1,5]]
**Explanation:** Intervals [1,4] and [4,5] are considered overlapping.
`
  }
];

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};


// Hook for Active Speaker detection
const useSpeechDetector = (stream, onSpeechToggle) => {
  useEffect(() => {
    if (!stream) {
      onSpeechToggle(false);
      return;
    }
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      onSpeechToggle(false);
      return;
    }

    let audioCtx;
    let source;
    let analyser;
    let rafId;

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const cleanStream = new MediaStream([audioTracks[0]]);
      source = audioCtx.createMediaStreamSource(cleanStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let isSpeaking = false;
      let consecutiveFrames = 0;

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const speaking = average > 12; // volume threshold

        if (speaking) {
          consecutiveFrames = Math.min(10, consecutiveFrames + 1);
        } else {
          consecutiveFrames = Math.max(0, consecutiveFrames - 1);
        }

        const speakDetected = consecutiveFrames > 3;

        if (speakDetected !== isSpeaking) {
          isSpeaking = speakDetected;
          onSpeechToggle(speakDetected);
        }
        rafId = requestAnimationFrame(checkVolume);
      };
      rafId = requestAnimationFrame(checkVolume);
    } catch (e) {
      // Browser autoplay/gesture policy warning bypass
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (source) {
        try { source.disconnect(); } catch (e) { }
      }
      if (analyser) {
        try { analyser.disconnect(); } catch (e) { }
      }
      if (audioCtx) {
        try { audioCtx.close(); } catch (e) { }
      }
    };
  }, [stream, onSpeechToggle]);
};

const RemoteVideo = ({ stream, camOn }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${camOn ? "opacity-100" : "opacity-0"}`}
    />
  );
};

const VideoTile = ({ participant, isLocal, localVideoRef, hasHand }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  useSpeechDetector(participant.stream, setIsSpeaking);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-2xl bg-secondary/10 dark:bg-card border overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-primary/35 transition-all duration-300 w-full h-full min-h-[160px] aspect-[4/3] ${
        isSpeaking
          ? "border-primary ring-2 ring-primary/35 shadow-[0_0_24px_rgba(13,99,27,0.3)] dark:shadow-[0_0_24px_rgba(136,217,130,0.25)] scale-[1.005] z-10"
          : "border-border/60"
      }`}
    >
      {/* Top right status badges like Hand Raise */}
      {hasHand && (
        <motion.div
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          className="absolute top-3 right-3 px-2.5 py-1.5 rounded-xl bg-amber-500/90 dark:bg-amber-500/80 backdrop-blur-md border border-amber-400/30 flex items-center gap-1.5 text-white shadow-lg shadow-amber-500/30 z-20 select-none"
          title="Hand Raised"
        >
          <span className="text-xs">✋</span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider hidden xs:inline">Hand Raised</span>
        </motion.div>
      )}

      {/* Video or Initials Avatar */}
      <div className="flex-1 relative flex flex-col items-center justify-center min-h-0 h-full w-full">
        {isLocal ? (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${participant.camOn ? "opacity-100" : "opacity-0"}`}
          />
        ) : (
          <RemoteVideo stream={participant.stream} camOn={participant.camOn} />
        )}

        {/* Soft bottom overlay gradient for readability */}
        {participant.camOn && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent pointer-events-none z-10" />
        )}

        {!participant.camOn && (
          <div className="flex flex-col items-center justify-center z-10 select-none relative w-full h-full">
            {/* Ambient Background Glow */}
            <div className="absolute w-36 h-36 rounded-full bg-primary/10 dark:bg-primary/5 blur-2xl pointer-events-none" />
            
            {/* Pulsating Ring Wrapper */}
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing rings */}
              <div className="absolute inset-0 rounded-full border border-primary/20 dark:border-primary/30 animate-pulse scale-[1.3] pointer-events-none" />
              <div className="absolute inset-0 rounded-full border border-primary/10 dark:border-primary/20 animate-ping scale-[1.5] opacity-20 pointer-events-none" />
              
              {/* Double-circle avatar */}
              <div className="w-16 h-16 rounded-full bg-secondary/80 dark:bg-muted/90 border border-border/80 dark:border-border/30 flex items-center justify-center p-1 relative shadow-inner z-10">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary/30 via-primary/15 to-primary/5 dark:from-primary/40 dark:via-primary/20 dark:to-primary/10 flex items-center justify-center text-primary text-xl font-black shadow-md border border-primary/20">
                  <span className="font-display tracking-wide">{getInitials(participant.userName)}</span>
                </div>
              </div>
            </div>
            
            <span className="text-[9px] font-extrabold text-primary/80 dark:text-primary/95 px-2.5 py-1 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/20 dark:border-primary/30 mt-4 uppercase tracking-widest shadow-sm select-none z-10">
              Camera Off
            </span>
          </div>
        )}
      </div>

      {/* Glassmorphic overlay name badge with mic status in bottom-left */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-md text-[10px] text-white font-semibold flex items-center gap-2 z-20 border border-white/10 shadow-lg select-none">
        <span className="truncate max-w-[90px] sm:max-w-[120px]">{participant.userName}</span>
        <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
          {participant.role}
        </span>
        {!participant.micOn && (
          <span className="text-rose-500 flex items-center shrink-0 animate-pulse" title="Microphone Muted">
            <MicOff size={11} className="stroke-[2.5]" />
          </span>
        )}
      </div>
    </motion.div>
  );
};

const MessageBubble = ({ msg, currentUserName, currentUserId }) => {
  const isOwnMessage = msg.userId
    ? String(msg.userId) === String(currentUserId)
    : msg.sender === currentUserName;
  return (
    <motion.div
      key={msg.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} mb-3`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[9px] font-bold tracking-wider ${isOwnMessage ? "text-primary/75" : "text-secondary-foreground/75"}`}>
          {isOwnMessage ? "YOU" : msg.sender}
        </span>
        <span className="text-[9px] text-muted-foreground/60">{msg.time}</span>
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs select-text leading-relaxed shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${isOwnMessage
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-[#f2f4f2] dark:bg-[#182219] text-foreground border border-border/40 rounded-tl-sm"
          }`}
      >
        {msg.message}
      </div>
    </motion.div>
  );
};

const formatMessageTime = (value) => {
  if (!value) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getSocketServerUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
  return apiBase.replace(/\/api\/v1\/?$/, "");
};

export default function InterviewRoom() {
  const { roomId } = useParams();
  const roleParam = new URLSearchParams(window.location.search).get("role");
  const roleOverride =
    roleParam === "interviewer" || roleParam === "candidate" ? roleParam : null;
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const editorStorageKey = `interviewos:room:${roomId || "default"}:editor`;
  const roomSessionKey = `interviewos:room-session:${roomId || "default"}`;

  // Tab mode: 'video' | 'editor' | 'whiteboard' | 'problem' | 'notes' | 'settings'
  const [activeTab, setActiveTab] = useState("video");
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));
  const [localMediaReady, setLocalMediaReady] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);



  // Collaborative multi-file state
  const [files, setFiles] = useState({
    "main.js": `// Two Sum Problem\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
    "solution.py": `# Python Solution\ndef two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))`
  });
  const [activeFile, setActiveFile] = useState("main.js");
  const [newFileName, setNewFileName] = useState("");
  const [showFileExplorer, setShowFileExplorer] = useState(true);

  // Problem statement state
  const [problemText, setProblemText] = useState(questionTemplates[0].markdown);

  // Interviewer Private Notes state
  const notesStorageKey = `interviewos:room:${roomId || "default"}:private-notes`;
  const [privateNotes, setPrivateNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(notesStorageKey);
      return saved ? JSON.parse(saved) : { text: "", score: 3, checklist: { communication: false, solving: false, coding: false } };
    } catch {
      return { text: "", score: 3, checklist: { communication: false, solving: false, coding: false } };
    }
  });

  const savePrivateNotes = (updated) => {
    setPrivateNotes(updated);
    try {
      localStorage.setItem(notesStorageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const [language, setLanguage] = useState("typescript");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [whiteboardKey, setWhiteboardKey] = useState("");

  // Media controls state
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const micOnRef = useRef(micOn);
  micOnRef.current = micOn;
  const camOnRef = useRef(camOn);
  camOnRef.current = camOn;
  const [chatInput, setChatInput] = useState("");
  const [timer, setTimer] = useState(3600);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(3600);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [roomTitle, setRoomTitle] = useState("Interview Room");
  const [messages, setMessages] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);

  // Custom states for refined End Session modal flow
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);
  const [isSessionEndedAlert, setIsSessionEndedAlert] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  const chatEndRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);

  // Custom states and refs for multi-peer/redesign
  const socketRef = useRef(null);
  const [activeSocket, setActiveSocket] = useState(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const readySignalSentRef = useRef(false);
  const peerConnectionsRef = useRef({}); // userId -> RTCPeerConnection
  const screenStreamRef = useRef(null);

  const [remoteStreams, setRemoteStreams] = useState({}); // userId -> MediaStream
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [roomLocked, setRoomLocked] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [statsData, setStatsData] = useState({});
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Raise hand state map
  const [raisedHands, setRaisedHands] = useState({});

  const [identity, setIdentity] = useState(() => {
    const fallbackName = user?.name || "Candidate";
    const fallbackRole = roleOverride || user?.role || "candidate";
    const fallbackDisplayName = roleOverride
      ? roleOverride === "interviewer"
        ? "Interviewer"
        : "Candidate"
      : fallbackName;
    const storageKey = `interviewos:identity:${roomId || "default"}`;
    const baseFallbackId = user?.id || user?._id || `guest-${Math.random().toString(36).slice(2, 10)}`;
    const fallbackId = roleOverride ? `${baseFallbackId}:${roleOverride}` : baseFallbackId;
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.userId) {
          return {
            userId: parsed.userId,
            userName: parsed.userName || fallbackName,
            role: parsed.role || fallbackRole,
          };
        }
      }
    } catch {
      // ignore
    }
    return {
      userId: fallbackId,
      userName: fallbackDisplayName,
      role: fallbackRole,
    };
  });

  const { violationCount, enterFullscreen } = useProctor({
    roomId,
    isEnabled: identity?.role === "candidate",
  });

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown === 0) {
      navigate(identity.role === "interviewer" ? `/feedback/${roomId}` : "/dashboard/candidate");
      return;
    }
    const timerId = setTimeout(() => {
      setRedirectCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [redirectCountdown, identity.role, navigate, roomId]);

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (roleOverride) return;
    const nextIdentity = {
      userId: user?.id || user?._id || identity.userId,
      userName: user?.name || identity.userName,
      role: user?.role || identity.role,
    };
    setIdentity((prev) => {
      if (
        prev.userId === nextIdentity.userId &&
        prev.userName === nextIdentity.userName &&
        prev.role === nextIdentity.role
      ) {
        return prev;
      }
      return nextIdentity;
    });
  }, [identity.role, identity.userId, identity.userName, roleOverride, user]);

  useEffect(() => {
    try {
      sessionStorage.setItem(`interviewos:identity:${roomId || "default"}`, JSON.stringify(identity));
    } catch {
      // ignore
    }
  }, [identity, roomId]);

  // Peer Connection management helpers
  const cleanupPeerConnectionForUser = useCallback((userId) => {
    const pc = peerConnectionsRef.current[userId];
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.close();
      delete peerConnectionsRef.current[userId];
    }
    setRemoteStreams((prev) => {
      if (!prev[userId]) return prev;
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  const cleanupAllPeerConnections = useCallback(() => {
    Object.keys(peerConnectionsRef.current).forEach((userId) => {
      cleanupPeerConnectionForUser(userId);
    });
    peerConnectionsRef.current = {};
    setRemoteStreams({});
  }, [cleanupPeerConnectionForUser]);

  const announceReadyIfPossible = useCallback(() => {
    if (!roomId || readySignalSentRef.current) return;
    if (!socketRef.current || !socketRef.current.connected) return;
    if (!localStreamRef.current) return;
    readySignalSentRef.current = true;
    socketRef.current.emit("webrtc:user-ready", {
      roomId,
      userId: identity.userId,
    });
  }, [identity.userId, roomId]);

  const buildPeerConnection = useCallback((targetUserId) => {
    if (peerConnectionsRef.current[targetUserId]) {
      return peerConnectionsRef.current[targetUserId];
    }

    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    peer.iceQueue = [];

    peer.onicecandidate = (event) => {
      if (!event.candidate || !socketRef.current) return;
      socketRef.current.emit("webrtc:ice-candidate", {
        roomId,
        candidate: event.candidate,
        fromUserId: identity.userId,
        toUserId: targetUserId,
      });
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStreams((prev) => ({
        ...prev,
        [targetUserId]: stream,
      }));
    };

    const localStream = localStreamRef.current;
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        if (track.kind === "video" && screenStreamRef.current) {
          const screenTrack = screenStreamRef.current.getVideoTracks()[0];
          if (screenTrack) {
            peer.addTrack(screenTrack, screenStreamRef.current);
            return;
          }
        }
        peer.addTrack(track, localStream);
      });
    }

    peerConnectionsRef.current[targetUserId] = peer;
    return peer;
  }, [identity.userId, roomId]);

  const startOffer = useCallback(async (toUserId) => {
    if (!toUserId || toUserId === identity.userId) return;
    if (!localStreamRef.current) return;

    const peer = buildPeerConnection(toUserId);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socketRef.current?.emit("webrtc:offer", {
      roomId,
      offer,
      fromUserId: identity.userId,
      toUserId,
    });
  }, [buildPeerConnection, identity.userId, roomId]);

  useEffect(() => {
    const startLocalMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        const actualMic = stream.getAudioTracks().some((track) => track.enabled);
        const actualCam = stream.getVideoTracks().some((track) => track.enabled);
        setMicOn(actualMic);
        setCamOn(actualCam);
        if (socketRef.current?.connected) {
          socketRef.current.emit("room:media-toggle", {
            roomId,
            userId: identity.userId,
            micOn: actualMic,
            camOn: actualCam,
          });
        }
      } catch {
        setMicOn(false);
        setCamOn(false);
        if (socketRef.current?.connected) {
          socketRef.current.emit("room:media-toggle", {
            roomId,
            userId: identity.userId,
            micOn: false,
            camOn: false,
          });
        }
        toast({
          title: "Media access denied",
          description: "Camera and microphone access is required for live interview calls.",
          variant: "destructive",
        });
      } finally {
        setLocalMediaReady(true);
        announceReadyIfPossible();
        // Send offers to any already connected users if we should initiate
        setConnectedUsers((currentList) => {
          currentList.forEach((remoteUser) => {
            if (String(remoteUser.userId) !== String(identity.userId)) {
              const shouldInitiate = String(identity.userId) > String(remoteUser.userId);
              if (shouldInitiate) {
                startOffer(remoteUser.userId).catch(() => {});
              }
            }
          });
          return currentList;
        });
      }
    };

    startLocalMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      cleanupAllPeerConnections();
    };
  }, [announceReadyIfPossible, cleanupAllPeerConnections, toast, startOffer, identity.userId, roomId]);

  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) return;
      try {
        const response = await api.get(`/rooms/${roomId}`);
        if (response.data.data?.title) {
          setRoomTitle(response.data.data.title);
        }
        const room = response.data.data;
        if (room?.whiteboardKey) {
          setWhiteboardKey(room.whiteboardKey);
        }
        const interviewerId = room?.interviewer?._id || room?.interviewer;
        const candidateId = room?.candidate?._id || room?.candidate;
        const interviewerName = room?.interviewer?.name;
        const candidateName = room?.candidate?.name;

        setIdentity((prev) => {
          if (roleOverride) {
            const normalizedBaseId = String(user?.id || user?._id || prev.userId).split(":")[0];
            const forcedRoleName = roleOverride === "interviewer"
              ? interviewerName || "Interviewer"
              : candidateName || "Candidate";
            return {
              ...prev,
              role: roleOverride,
              userId: `${normalizedBaseId}:${roleOverride}`,
              userName: forcedRoleName,
            };
          }
          const normalizedId = String(prev.userId);
          let role = prev.role;
          if (interviewerId && String(interviewerId) === normalizedId) role = "interviewer";
          if (candidateId && String(candidateId) === normalizedId) role = "candidate";
          const hasDefaultName = !prev.userName || prev.userName === "Candidate";
          return {
            ...prev,
            role,
            userName: hasDefaultName
              ? (role === "interviewer" ? interviewerName : candidateName) || prev.userName || "Candidate"
              : prev.userName,
          };
        });

        if (response.data.data?.durationMinutes) {
          const durationSeconds = response.data.data.durationMinutes * 60;
          setTimer(durationSeconds);
          setTotalDurationSeconds(durationSeconds);
        }
      } catch {
        setRoomTitle("Interview Room");
      }
    };
    loadRoom();
  }, [identity.userId, roleOverride, roomId, user?.id, user?._id]);

  useEffect(() => {
    if (!roomId || !localMediaReady) return;

    const socket = io(getSocketServerUrl(), {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;
    setActiveSocket(socket);

    const onConnect = () => {
      socket.emit("room:join", {
        roomId,
        userId: identity.userId,
        role: identity.role,
        userName: identity.userName,
        micOn: micOnRef.current,
        camOn: camOnRef.current,
      });
      announceReadyIfPossible();
    };

    const onUserList = ({ users }) => {
      const list = Array.isArray(users) ? users : [];
      setConnectedUsers(list);

      // Lock room auto-kick
      if (identity.role === "interviewer" && roomLocked) {
        const newCandidates = list.filter(
          (entry) => entry.role === "candidate" && !peerConnectionsRef.current[entry.userId]
        );
        newCandidates.forEach((candidate) => {
          socket.emit("room:control", {
            roomId,
            action: "remove-participant",
            targetUserId: candidate.userId,
          });
        });
      }

      const remoteUsers = list.filter((entry) => String(entry.userId) !== String(identity.userId));

      // Cleanup left peers
      const remoteUserIds = new Set(remoteUsers.map((u) => u.userId));
      Object.keys(peerConnectionsRef.current).forEach((userId) => {
        if (!remoteUserIds.has(userId)) {
          cleanupPeerConnectionForUser(userId);
        }
      });

      // Peer connect
      remoteUsers.forEach((remoteUser) => {
        const peer = buildPeerConnection(remoteUser.userId);
        const shouldInitiate = String(identity.userId) > String(remoteUser.userId);
        if (shouldInitiate && peer.signalingState === "stable") {
          startOffer(remoteUser.userId).catch(() => { });
        }
      });
    };

    const onChatMessage = (payload) => {
      if (!payload?.message) return;
      const senderName =
        payload.userName ||
        (String(payload.userId) === String(identity.userId)
          ? identity.userName
          : "Participant");
      setMessages((prev) => [
        ...prev,
        {
          id:
            payload.chatId ||
            `${payload.userId || "msg"}-${payload.timestamp || Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 7)}`,
          userId: payload.userId,
          sender: senderName,
          message: payload.message,
          time: formatMessageTime(payload.timestamp),
        },
      ]);
    };

    const onChatHistory = (historyList) => {
      if (!Array.isArray(historyList)) return;
      const formatted = historyList.map(payload => {
        const senderName =
          payload.userName ||
          (String(payload.userId) === String(identity.userId)
            ? identity.userName
            : "Participant");
        return {
          id: payload.chatId || `${payload.userId || "msg"}-${payload.timestamp || Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId: payload.userId,
          sender: senderName,
          message: payload.message,
          time: formatMessageTime(payload.timestamp),
        };
      });
      setMessages(formatted);
    };

    const onUserReady = ({ userId }) => {
      if (!userId || String(userId) === String(identity.userId)) return;
      const shouldInitiate = String(identity.userId) > String(userId);
      if (shouldInitiate) {
        startOffer(userId).catch(() => { });
      }
    };

    const onOffer = async ({ offer, fromUserId }) => {
      if (!offer || !fromUserId || String(fromUserId) === String(identity.userId)) return;
      const peer = buildPeerConnection(fromUserId);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));

      // Process queued candidates
      if (peer.iceQueue && peer.iceQueue.length > 0) {
        for (const candidate of peer.iceQueue) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error("Error adding queued ice candidate", e);
          }
        }
        peer.iceQueue = [];
      }

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("webrtc:answer", {
        roomId,
        answer,
        fromUserId: identity.userId,
        toUserId: fromUserId,
      });
    };

    const onAnswer = async ({ answer, fromUserId }) => {
      if (!answer || !fromUserId) return;
      const pc = peerConnectionsRef.current[fromUserId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        // Process queued candidates
        if (pc.iceQueue && pc.iceQueue.length > 0) {
          for (const candidate of pc.iceQueue) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error("Error adding queued ice candidate", e);
            }
          }
          pc.iceQueue = [];
        }
      }
    };

    const onIceCandidate = async ({ candidate, fromUserId }) => {
      if (!candidate || !fromUserId) return;
      const pc = peerConnectionsRef.current[fromUserId];
      if (pc) {
        try {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            pc.iceQueue = pc.iceQueue || [];
            pc.iceQueue.push(candidate);
          }
        } catch (e) {
          console.error("Error adding ice candidate", e);
        }
      }
    };

    const onCallEnd = ({ fromUserId }) => {
      if (fromUserId) {
        cleanupPeerConnectionForUser(fromUserId);
      } else {
        cleanupAllPeerConnections();
      }
    };

    const onMediaToggle = ({ userId, micOn, camOn }) => {
      setConnectedUsers((prev) =>
        prev.map((user) => {
          if (String(user.userId) === String(userId)) {
            return {
              ...user,
              micOn: micOn !== undefined ? micOn : user.micOn,
              camOn: camOn !== undefined ? camOn : user.camOn,
            };
          }
          return user;
        })
      );
    };

    const onRoomControl = ({ action, targetUserId, value }) => {
      if (action === "mute-all") {
        if (identity.role === "candidate") {
          const stream = localStreamRef.current;
          if (stream) {
            stream.getAudioTracks().forEach((track) => {
              track.enabled = false;
            });
          }
          setMicOn(false);
          socket.emit("room:media-toggle", {
            roomId,
            userId: identity.userId,
            micOn: false,
          });
          toast({
            title: "Muted by Interviewer",
            description: "The interviewer has muted your microphone.",
          });
        }
      } else if (action === "toggle-camera") {
        if (identity.role === "candidate" && (!targetUserId || String(targetUserId) === String(identity.userId))) {
          const stream = localStreamRef.current;
          if (stream) {
            stream.getVideoTracks().forEach((track) => {
              track.enabled = false;
            });
          }
          setCamOn(false);
          socket.emit("room:media-toggle", {
            roomId,
            userId: identity.userId,
            camOn: false,
          });
          toast({
            title: "Camera Disabled",
            description: "The interviewer has disabled your camera.",
          });
        }
      } else if (action === "remove-participant") {
        if (String(targetUserId) === String(identity.userId)) {
          toast({
            title: "Removed from Session",
            description: "You have been removed from this interview room by the interviewer.",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate("/");
          }, 2000);
        }
      } else if (action === "raise-hand") {
        setRaisedHands(prev => ({ ...prev, [targetUserId]: value }));

        // Interviewer audio & visual buzzer alert
        if (identity.role === "interviewer" && value && String(targetUserId) !== String(identity.userId)) {
          const u = list => (list.find(e => String(e.userId) === String(targetUserId)));
          toast({
            title: "Hand Raised ✋",
            description: "A candidate is requesting attention.",
          });

          // Web Audio API beep
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.18);
          } catch (e) {
            // ignore audio block
          }
        }
      } else if (action === "problem-update") {
        setProblemText(value);
      } else if (action === "code-update") {
        const { filePath, code } = value;
        setFiles(prev => ({
          ...prev,
          [filePath]: code
        }));
      } else if (action === "file-create") {
        const { filePath } = value;
        setFiles(prev => ({
          ...prev,
          [filePath]: `// New file ${filePath}\n`
        }));
      } else if (action === "file-delete") {
        const { filePath } = value;
        setFiles(prev => {
          const next = { ...prev };
          delete next[filePath];
          return next;
        });
        setActiveFile(prev => {
          if (prev === filePath) {
            return "main.js";
          }
          return prev;
        });
      } else if (action === "session-ended") {
        cleanupAllPeerConnections();
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => track.stop());
          screenStreamRef.current = null;
        }
        setIsSessionEndedAlert(true);
        setRedirectCountdown(5);
      }
    };

    socket.on("connect", onConnect);
    socket.on("room:user-list", onUserList);
    socket.on("chat:message", onChatMessage);
    socket.on("chat:history", onChatHistory);
    socket.on("webrtc:user-ready", onUserReady);
    socket.on("webrtc:offer", onOffer);
    socket.on("webrtc:answer", onAnswer);
    socket.on("webrtc:ice-candidate", onIceCandidate);
    socket.on("webrtc:call-end", onCallEnd);
    socket.on("room:media-toggle", onMediaToggle);
    socket.on("room:control", onRoomControl);

    return () => {
      if (socket.connected) {
        socket.emit("room:leave", {
          roomId,
          userId: identity.userId,
        });
        socket.emit("webrtc:call-end", {
          roomId,
          fromUserId: identity.userId,
        });
      }
      socket.off("connect", onConnect);
      socket.off("room:user-list", onUserList);
      socket.off("chat:message", onChatMessage);
      socket.off("chat:history", onChatHistory);
      socket.off("webrtc:user-ready", onUserReady);
      socket.off("webrtc:offer", onOffer);
      socket.off("webrtc:answer", onAnswer);
      socket.off("webrtc:ice-candidate", onIceCandidate);
      socket.off("webrtc:call-end", onCallEnd);
      socket.off("room:media-toggle", onMediaToggle);
      socket.off("room:control", onRoomControl);
      socket.disconnect();
      socketRef.current = null;
      setActiveSocket(null);
      readySignalSentRef.current = false;
    };
  }, [
    announceReadyIfPossible,
    buildPeerConnection,
    cleanupPeerConnectionForUser,
    cleanupAllPeerConnections,
    identity.role,
    identity.userId,
    identity.userName,
    roomId,
    startOffer,
    roomLocked,
    navigate,
    toast,
    localMediaReady,
  ]);

  const elapsedSeconds = Math.max(0, totalDurationSeconds - timer);
  const sessionProgress =
    totalDurationSeconds > 0
      ? Math.min(100, Math.round((elapsedSeconds / totalDurationSeconds) * 100))
      : 0;

  const persistEditorState = useCallback(
    (triggeredBy) => {
      try {
        localStorage.setItem(
          editorStorageKey,
          JSON.stringify({
            roomId,
            language,
            codeByLanguage: files,
            updatedAt: new Date().toISOString(),
            triggeredBy,
          })
        );
        const now = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setLastSavedAt(now);
        if (triggeredBy === "manual") {
          toast({ title: "Code saved", description: `Saved at ${now}` });
        }
      } catch {
        if (triggeredBy === "manual") {
          toast({
            title: "Save failed",
            description: "Unable to save editor state locally.",
            variant: "destructive",
          });
        }
      }
    },
    [files, editorStorageKey, language, roomId, toast]
  );

  useEffect(() => {
    if (autosaveTimeoutRef.current) {
      window.clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = window.setTimeout(() => {
      persistEditorState("auto");
    }, 1200);
    return () => {
      if (autosaveTimeoutRef.current) {
        window.clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [persistEditorState]);

  const handleManualSave = useCallback(() => {
    setIsSaving(true);
    persistEditorState("manual");
    window.setTimeout(() => setIsSaving(false), 300);
  }, [persistEditorState]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleManualSave]);

  const handleRun = async () => {
    const activeCode = files[activeFile] || "";
    if (!activeCode.trim()) {
      setOutput("Please write some code before running.\n");
      return;
    }
    setIsRunning(true);
    setOutput(`Running ${activeFile} code...\n`);
    try {
      const sessionId = sessionStorage.getItem(roomSessionKey) || undefined;
      const response = await api.post(`/rooms/${roomId}/code/execute`, {
        roomId,
        language,
        code: activeCode,
        ...(sessionId ? { sessionId } : {}),
      });
      if (!response.data.success || !response.data.data) {
        setOutput(response.data.message || "Execution failed.\n");
        return;
      }
      const { stdout = "", stderr = "", time = "0", memory = 0 } = response.data.data;
      const sections = [
        stdout ? stdout.trimEnd() : "",
        stderr ? stderr.trimEnd() : "",
        `\nTime: ${time}s`,
        `Memory: ${memory || 0} KB`,
      ].filter(Boolean);
      setOutput(sections.join("\n"));
    } catch (error) {
      setOutput(
        error?.response?.data?.message ||
        "Execution failed. Make sure the room is started and the execution service is available.\n"
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleCodeChange = (value) => {
    const nextCode = value || "";
    setFiles(prev => ({
      ...prev,
      [activeFile]: nextCode
    }));

    // Synchronize content
    socketRef.current?.emit("room:control", {
      roomId,
      action: "code-update",
      value: { filePath: activeFile, code: nextCode }
    });
  };

  const handleCreateFile = () => {
    const name = newFileName.trim();
    if (!name) return;
    if (files[name] !== undefined) {
      toast({ title: "File exists", description: "A file with this name already exists.", variant: "destructive" });
      return;
    }
    setFiles(prev => ({ ...prev, [name]: `// New file ${name}\n` }));
    setActiveFile(name);
    setNewFileName("");

    const ext = name.split(".").pop();
    let lang = "javascript";
    if (ext === "py") lang = "python";
    else if (ext === "java") lang = "java";
    else if (ext === "cpp" || ext === "cc") lang = "cpp";
    else if (ext === "go") lang = "go";
    else if (ext === "rs") lang = "rust";
    else if (ext === "ts") lang = "typescript";
    setLanguage(lang);

    socketRef.current?.emit("room:control", {
      roomId,
      action: "file-create",
      value: { filePath: name }
    });
  };

  const handleDeleteFile = (filePath) => {
    if (Object.keys(files).length <= 1) {
      toast({ title: "Cannot delete", description: "You must keep at least one file.", variant: "destructive" });
      return;
    }
    setFiles(prev => {
      const next = { ...prev };
      delete next[filePath];
      return next;
    });
    if (activeFile === filePath) {
      const remaining = Object.keys(files).filter(f => f !== filePath);
      setActiveFile(remaining[0]);
    }

    socketRef.current?.emit("room:control", {
      roomId,
      action: "file-delete",
      value: { filePath }
    });
  };

  const handleToggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const nextMic = !micOn;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = nextMic;
    });
    setMicOn(nextMic);
    socketRef.current?.emit("room:media-toggle", {
      roomId,
      userId: identity.userId,
      micOn: nextMic,
    });
  };

  const handleToggleCam = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const nextCam = !camOn;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = nextCam;
    });
    setCamOn(nextCam);
    socketRef.current?.emit("room:media-toggle", {
      roomId,
      userId: identity.userId,
      camOn: nextCam,
    });
  };

  const handleToggleScreenShare = async () => {
    if (isSharingScreen) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      setIsSharingScreen(false);
      const localVideoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (localVideoTrack) {
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(localVideoTrack);
          }
        });
      }
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        setIsSharingScreen(true);

        const screenTrack = stream.getVideoTracks()[0];
        screenTrack.onended = () => {
          handleToggleScreenShare();
        };

        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Screen share error:", err);
        toast({
          title: "Screen Share failed",
          description: "Could not share screen or permission denied.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEndCall = () => {
    setShowEndSessionConfirm(true);
  };

  const handleOfficialEndSession = () => {
    socketRef.current?.emit("room:control", {
      roomId,
      action: "session-ended",
    });
    socketRef.current?.emit("webrtc:call-end", {
      roomId,
      fromUserId: identity.userId,
    });
    cleanupAllPeerConnections();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    navigate(`/feedback/${roomId}`);
  };

  const handleLeaveRoom = () => {
    socketRef.current?.emit("webrtc:call-end", {
      roomId,
      fromUserId: identity.userId,
    });
    cleanupAllPeerConnections();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    navigate(identity.role === "interviewer" ? "/dashboard/interviewer" : "/dashboard/candidate");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Meeting link copied to clipboard.",
    });
  };

  const handleMuteAll = () => {
    socketRef.current?.emit("room:control", {
      roomId,
      action: "mute-all",
    });
    toast({
      title: "Muted All",
      description: "Sent mute command to all candidates.",
    });
  };

  const handleRemoveParticipant = (targetUserId) => {
    socketRef.current?.emit("room:control", {
      roomId,
      action: "remove-participant",
      targetUserId,
    });
    toast({
      title: "Removing Participant",
      description: "Participant removal command sent.",
    });
  };

  const handleToggleParticipantCamera = (targetUserId) => {
    socketRef.current?.emit("room:control", {
      roomId,
      action: "toggle-camera",
      targetUserId,
    });
    toast({
      title: "Disabling Camera",
      description: "Sent command to toggle camera off.",
    });
  };

  const handleToggleLock = () => {
    const nextLocked = !roomLocked;
    setRoomLocked(nextLocked);
    toast({
      title: nextLocked ? "Room Locked" : "Room Unlocked",
      description: nextLocked ? "New candidate joins will be blocked." : "New candidates can join.",
    });
  };

  const fetchConnectionStats = async () => {
    const statsObj = {};
    for (const [userId, pc] of Object.entries(peerConnectionsRef.current)) {
      try {
        const stats = await pc.getStats();
        const statsList = [];
        stats.forEach((report) => {
          if (report.type === "inbound-rtp" && (report.kind === "video" || report.kind === "audio")) {
            statsList.push({
              kind: report.kind,
              bytesReceived: report.bytesReceived,
              packetsReceived: report.packetsReceived,
              packetsLost: report.packetsLost,
              jitter: report.jitter,
            });
          }
          if (report.type === "outbound-rtp" && (report.kind === "video" || report.kind === "audio")) {
            statsList.push({
              kind: report.kind,
              bytesSent: report.bytesSent,
              packetsSent: report.packetsSent,
            });
          }
          if (report.type === "candidate-pair" && report.state === "succeeded") {
            statsList.push({
              kind: "network",
              currentRoundTripTime: report.currentRoundTripTime,
              availableIncomingBitrate: report.availableIncomingBitrate,
              availableOutgoingBitrate: report.availableOutgoingBitrate,
            });
          }
        });
        statsObj[userId] = statsList;
      } catch (err) {
        console.error(err);
      }
    }
    setStatsData(statsObj);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) return;
    socketRef.current?.emit("chat:message", {
      roomId,
      message: trimmed,
      userId: identity.userId,
      userName: identity.userName,
      timestamp: new Date().toISOString(),
    });
    setChatInput("");
  };

  // Compile participants data for video grid rendering
  const participants = [
    {
      userId: identity.userId,
      userName: identity.userName + " (You)",
      role: identity.role,
      stream: localStreamRef.current,
      isLocal: true,
      micOn: micOn,
      camOn: camOn,
    },
    ...connectedUsers
      .filter((u) => String(u.userId) !== String(identity.userId))
      .map((u) => ({
        userId: u.userId,
        userName: u.userName || "Participant",
        role: u.role,
        stream: remoteStreams[u.userId],
        isLocal: false,
        micOn: u.micOn !== false,
        camOn: u.camOn !== false,
      })),
  ];

  const handleProblemChange = (val) => {
    setProblemText(val);
    socketRef.current?.emit("room:control", {
      roomId,
      action: "problem-update",
      value: val
    });
  };

  const renderVideoGrid = () => {
    const len = participants.length;
    if (len === 1) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-0 w-full h-full p-4">
          <div className="w-full max-w-sm sm:max-w-xl aspect-[4/3]">
            <VideoTile participant={participants[0]} isLocal={true} localVideoRef={localVideoRef} hasHand={raisedHands[participants[0].userId]} />
          </div>
        </div>
      );
    }
    if (len === 2) {
      return (
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-center min-h-0 w-full h-full p-4">
          {participants.map((p) => (
            <VideoTile key={p.userId} participant={p} isLocal={p.isLocal} localVideoRef={localVideoRef} hasHand={raisedHands[p.userId]} />
          ))}
        </div>
      );
    }
    if (len === 3) {
      return (
        <div className="flex-1 flex flex-col gap-4 justify-center min-h-0 w-full h-full p-4">
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <VideoTile participant={participants[0]} isLocal={participants[0].isLocal} localVideoRef={localVideoRef} hasHand={raisedHands[participants[0].userId]} />
            <VideoTile participant={participants[1]} isLocal={participants[1].isLocal} localVideoRef={localVideoRef} hasHand={raisedHands[participants[1].userId]} />
          </div>
          <div className="flex justify-center flex-1 min-h-0">
            <div className="w-1/2 min-w-[200px]">
              <VideoTile participant={participants[2]} isLocal={participants[2].isLocal} localVideoRef={localVideoRef} hasHand={raisedHands[participants[2].userId]} />
            </div>
          </div>
        </div>
      );
    }
    // 4 or more participants
    return (
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 min-h-0 w-full h-full p-4">
        {participants.slice(0, 4).map((p) => (
          <VideoTile key={p.userId} participant={p} isLocal={p.isLocal} localVideoRef={localVideoRef} hasHand={raisedHands[p.userId]} />
        ))}
      </div>
    );
  };

  const tabs = [
    { id: "video", label: "Video Call", icon: VideoIcon },
    { id: "editor", label: "Code Editor", icon: Code2 },
    { id: "whiteboard", label: "Whiteboard", icon: PenTool },
    { id: "problem", label: "Problem Statement", icon: FileText },
    { id: "notes", label: "Private Notes", icon: ClipboardList, interviewerOnly: true },
    { id: "settings", label: "Room Settings", icon: Settings },
  ];

  return (
    <div className="room-container h-[100dvh] flex flex-col bg-background overflow-hidden selection:bg-primary/30">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

            .room-container {
              font-family: 'Montserrat', sans-serif !important;
              --primary: 130 77% 22% !important; /* #0d631b */
              --primary-foreground: 0 0% 100% !important;
              --background: 120 10% 98% !important; /* #f8faf8 */
              --foreground: 160 5% 10% !important; /* #191c1b */
              --card: 120 10% 98% !important; /* #f8faf8 */
              --card-foreground: 160 5% 10% !important;
              --popover: 120 10% 98% !important;
              --popover-foreground: 160 5% 10% !important;
              --secondary: 120 5% 93% !important; /* #eceeec */
              --secondary-foreground: 121 40% 32% !important; /* #307231 */
              --muted: 120 5% 95% !important; /* #f2f4f2 */
              --muted-foreground: 110 9% 26% !important; /* #40493d */
              --accent: 130 77% 22% !important;
              --accent-foreground: 0 0% 100% !important;
              --border: 101 14% 76% !important; /* #bfcaba */
              --input: 101 14% 76% !important;
              --ring: 130 77% 22% !important;
            }

            .dark .room-container, .room-container.dark {
              --primary: 116 53% 68% !important; /* #88d982 */
              --primary-foreground: 131 100% 11% !important; /* #00390a */
              --background: 130 15% 5% !important; /* #0c0f0d */
              --foreground: 120 10% 95% !important; /* #eff2ef */
              --card: 130 12% 8% !important; /* #111612 */
              --card-foreground: 120 10% 95% !important;
              --popover: 130 12% 8% !important;
              --popover-foreground: 120 10% 95% !important;
              --secondary: 128 17% 11% !important; /* #182219 */
              --secondary-foreground: 115 88% 79% !important; /* #a3f69c */
              --muted: 128 12% 12% !important; /* #1b221c */
              --muted-foreground: 127 6% 56% !important; /* #8a948b */
              --accent: 116 53% 68% !important;
              --accent-foreground: 131 100% 11% !important;
              --border: 131 8% 19% !important; /* #2d362f */
              --input: 131 8% 19% !important;
              --ring: 116 53% 68% !important;
            }

            .room-container button,
            .room-container input,
            .room-container select,
            .room-container textarea,
            .room-container span,
            .room-container div,
            .room-container a {
              font-family: 'Montserrat', sans-serif !important;
            }

            /* Custom dot grid background */
            .bg-room-dot-pattern {
              background-image: radial-gradient(circle, rgba(13, 99, 27, 0.06) 1px, transparent 1px);
              background-size: 20px 20px;
            }
            .dark .bg-room-dot-pattern {
              background-image: radial-gradient(circle, rgba(136, 217, 130, 0.05) 1px, transparent 1px);
              background-size: 20px 20px;
            }

            /* Pulse glow for messaging online badge */
            @keyframes pulse-green {
              0%, 100% {
                box-shadow: 0 0 0 0 rgba(13, 99, 27, 0.4);
                transform: scale(1);
              }
              50% {
                box-shadow: 0 0 0 6px rgba(13, 99, 27, 0);
                transform: scale(1.1);
              }
            }
            @keyframes pulse-green-dark {
              0%, 100% {
                box-shadow: 0 0 0 0 rgba(136, 217, 130, 0.4);
                transform: scale(1);
              }
              50% {
                box-shadow: 0 0 0 6px rgba(136, 217, 130, 0);
                transform: scale(1.1);
              }
            }
            .room-pulse-green {
              animation: pulse-green 2s infinite;
              background-color: #0d631b !important;
            }
            .dark .room-pulse-green {
              animation: pulse-green-dark 2s infinite;
              background-color: #88d982 !important;
            }
            
            /* Custom Scrollbar for messaging and console */
            .room-container ::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .room-container ::-webkit-scrollbar-track {
              background: transparent;
            }
            .room-container ::-webkit-scrollbar-thumb {
              background: rgba(13, 99, 27, 0.2);
              border-radius: 3px;
            }
            .dark .room-container ::-webkit-scrollbar-thumb {
              background: rgba(136, 217, 130, 0.15);
            }
            .room-container ::-webkit-scrollbar-thumb:hover {
              background: rgba(13, 99, 27, 0.3);
            }
            .dark .room-container ::-webkit-scrollbar-thumb:hover {
              background: rgba(136, 217, 130, 0.25);
            }
          `,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 border-b border-border/60 bg-card/85 backdrop-blur-md flex flex-col lg:flex-row lg:items-center lg:justify-between px-6 py-2.5 lg:h-16 shrink-0 z-30 gap-3 select-none shadow-sm">
        <div className="flex items-center gap-3 min-w-0 w-full lg:w-auto">
          <Link to="/" className="group flex items-center gap-2.5 cursor-pointer select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d631b] to-[#2e7d32] dark:from-[#88d982] dark:to-[#307231] flex items-center justify-center shadow-md shadow-primary/10 group-hover:scale-105 transition-transform">
              <Terminal className="w-4.5 h-4.5 text-white dark:text-[#00390a]" />
            </div>
            <span className="font-bold tracking-tight text-lg text-primary" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              InterviewOS
            </span>
          </Link>
          <div className="h-6 w-[1px] bg-border/60 mx-1.5 hidden sm:block" />
          <div className="hidden sm:flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-bold text-foreground truncate">
              {roomTitle}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">
              {roomId}
            </span>
          </div>
        </div>

        <div className="w-full lg:w-auto flex flex-wrap items-center gap-2.5 justify-end">
          <div
            className={`h-7 px-3 text-[11px] font-bold rounded-full border flex items-center gap-1.5 select-none transition-all duration-300 ${
              isOnline
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/15 border-destructive/20 text-destructive"
            }`}
            aria-live="polite"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
            {isOnline ? "Live Session" : "Disconnected"}
          </div>

          {/* Proctoring badge in header */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition-all duration-300 ${
              violationCount > 0
                ? "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse"
                : "bg-primary/10 border-primary/20 text-primary dark:text-[#88d982]"
            }`}
          >
            {violationCount > 0 ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-primary dark:text-[#88d982]" />
            )}
            <span>Proctoring:</span>{" "}
            {violationCount > 0 ? `${violationCount} Violations` : "Secure"}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold font-mono bg-secondary/40 dark:bg-muted/70 px-3 py-1.5 rounded-xl border border-border/60 dark:border-white/5">
            <Clock className="w-4 h-4 text-primary" />
            <span className={timer < 300 ? "text-destructive font-bold animate-pulse" : "text-foreground"}>
              {formatTime(timer)}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-secondary/40 dark:bg-muted/50 p-1 rounded-xl border border-border/50 dark:border-white/5">
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 rounded hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/25 active:scale-95 transition-all duration-200"
              onClick={handleCopyLink}
              title="Copy Room Link"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 rounded hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/25 active:scale-95 transition-all duration-200"
              onClick={() => {
                const subject = encodeURIComponent(`Join my InterviewOS Room: ${roomTitle}`);
                const body = encodeURIComponent(`Please join the interview session here: ${window.location.href}`);
                window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
              }}
              title="Invite via Email"
            >
              <Mail className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 rounded hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/25 active:scale-95 transition-all duration-200"
              onClick={handleCopyLink}
              title="Share Room"
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 gap-1.5 border border-border/50 hover:bg-secondary active:scale-95 transition-all duration-200"
            onClick={enterFullscreen}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </Button>
        </div>
      </header>

      {/* Main layout frame (3 panels) */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* PANEL 1: Left Sidebar Icon navigation (SaaS Workspace Vibe) */}
        <nav className="w-16 border-r border-border/60 bg-card/65 dark:bg-[#111612]/65 backdrop-blur-md flex flex-col items-center py-5 gap-4.5 shrink-0 select-none">
          {tabs
            .filter(tab => !tab.interviewerOnly || identity.role === "interviewer")
            .map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 relative group active:scale-90 hover:scale-105 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 dark:shadow-primary/15 scale-105 border border-primary/20 dark:border-white/10"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/15 dark:hover:text-primary-foreground"
                  }`}
                  title={tab.label}
                >
                  <IconComp className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-primary-foreground rounded-r-md" />
                  )}
                </button>
              );
            })}
        </nav>

        {/* PANEL 2: Center Main Content area */}
        <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">

          {/* TAB: Video Call view */}
          {activeTab === "video" && (
            <div className="flex-1 flex flex-col min-h-0 bg-card/5 bg-room-dot-pattern relative pb-24 overflow-y-auto">
              {renderVideoGrid()}
            </div>
          )}

          {/* TAB: Code Editor view (multi-file IDE layout) */}
          {activeTab === "editor" && (
            <React.Suspense fallback={
              <div className="flex-1 flex items-center justify-center select-none text-xs text-muted-foreground pb-20">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span>Loading Editor...</span>
                </div>
              </div>
            }>
              <EditorTabPanel
                files={files}
                activeFile={activeFile}
                setActiveFile={setActiveFile}
                newFileName={newFileName}
                setNewFileName={setNewFileName}
                showFileExplorer={showFileExplorer}
                setShowFileExplorer={setShowFileExplorer}
                language={language}
                setLanguage={setLanguage}
                handleManualSave={handleManualSave}
                isSaving={isSaving}
                handleRun={handleRun}
                isRunning={isRunning}
                output={output}
                setOutput={setOutput}
                isDark={isDark}
                handleCodeChange={handleCodeChange}
                handleDeleteFile={handleDeleteFile}
                handleCreateFile={handleCreateFile}
                lastSavedAt={lastSavedAt}
              />
            </React.Suspense>
          )}

          {/* TAB: Whiteboard view */}
          {activeTab === "whiteboard" && (
            <div className="flex-1 bg-background pb-20 relative overflow-hidden">
              <React.Suspense fallback={
                <div className="flex-1 flex items-center justify-center select-none text-xs text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span>Loading Whiteboard...</span>
                  </div>
                </div>
              }>
                <WhiteboardPanel isDark={isDark} roomId={roomId} socket={activeSocket} whiteboardKey={whiteboardKey} />
              </React.Suspense>
            </div>
          )}

          {/* TAB: Problem Statement view */}
          {activeTab === "problem" && (
            <React.Suspense fallback={
              <div className="flex-1 flex items-center justify-center select-none text-xs text-muted-foreground pb-20">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span>Loading Problem Statement...</span>
                </div>
              </div>
            }>
              <ProblemTabPanel
                identity={identity}
                problemText={problemText}
                handleProblemChange={handleProblemChange}
                questionTemplates={questionTemplates}
              />
            </React.Suspense>
          )}

          {/* TAB: Private Notes view (Interviewer only) */}
          {activeTab === "notes" && identity.role === "interviewer" && (
            <div className="flex-1 p-6 space-y-6 overflow-y-auto pb-24 max-w-2xl select-none">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-border/50 pb-2">
                <ClipboardList className="w-5 h-5" /> Private Interviewer Notes
              </h2>

              <div className="p-4 rounded-xl border border-border/80 bg-secondary/10 space-y-3">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Candidate Score Assessment</div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={privateNotes.score}
                    onChange={(e) => savePrivateNotes({ ...privateNotes, score: Number(e.target.value) })}
                    className="flex-1 accent-primary h-2 rounded bg-border cursor-pointer"
                  />
                  <span className="w-8 text-center text-sm font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                    {privateNotes.score} / 5
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border/80 bg-secondary/10 space-y-3">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Evaluation Checklist</div>
                <div className="space-y-2.5">
                  {[
                    { id: "solving", label: "Structured Problem Solving" },
                    { id: "communication", label: "Clear & Concise Communication" },
                    { id: "coding", label: "Clean Code Quality & Standard Practices" }
                  ].map((item) => (
                    <label key={item.id} className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privateNotes.checklist[item.id] || false}
                        onChange={(e) => {
                          const checklist = { ...privateNotes.checklist, [item.id]: e.target.checked };
                          savePrivateNotes({ ...privateNotes, checklist });
                        }}
                        className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border/80 bg-secondary/10 space-y-3">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Remarks & Feedback</div>
                <textarea
                  value={privateNotes.text}
                  onChange={(e) => savePrivateNotes({ ...privateNotes, text: e.target.value })}
                  placeholder="Enter interviewer details, summary comments, candidate observation metrics..."
                  className="w-full h-32 p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-xs font-medium leading-relaxed resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB: Room Settings view */}
          {activeTab === "settings" && (
            <div className="flex-1 p-6 space-y-6 overflow-y-auto pb-24 max-w-2xl select-none">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2 border-b border-border/50 pb-2">
                <Settings className="w-5 h-5" /> Room Settings & Statistics
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border/80 bg-secondary/20">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Room ID</div>
                  <div className="font-mono text-xs sm:text-sm font-bold truncate">{roomId}</div>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-secondary/20">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Session Title</div>
                  <div className="text-sm font-bold truncate">{roomTitle}</div>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-secondary/20">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Your Identity</div>
                  <div className="text-sm font-bold truncate flex items-center gap-2">
                    {identity.userName}
                    <Badge className="bg-primary/25 text-primary border-0 text-[9px] font-bold py-0 h-4">
                      {identity.role}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-secondary/20">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">Session Timer</div>
                  <div className="text-sm font-bold truncate">{formatTime(timer)} left / {formatTime(totalDurationSeconds)}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border/80 bg-secondary/20 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Action Controls</div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={handleCopyLink}>
                    <Copy className="mr-1.5 w-3.5 h-3.5" /> Copy Meeting Link
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={enterFullscreen}>
                    <Maximize2 className="mr-1.5 w-3.5 h-3.5" /> Toggle Fullscreen
                  </Button>
                  {identity.role === "interviewer" && (
                    <>
                      <Button variant="outline" size="sm" className="rounded-lg text-xs text-destructive hover:bg-destructive/10" onClick={handleMuteAll}>
                        <VolumeX className="mr-1.5 w-3.5 h-3.5" /> Mute All
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={handleToggleLock}>
                        {roomLocked ? <Unlock className="mr-1.5 w-3.5 h-3.5" /> : <Lock className="mr-1.5 w-3.5 h-3.5" />}
                        {roomLocked ? "Unlock Room" : "Lock Room"}
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => { fetchConnectionStats(); setShowStatsModal(true); }}>
                        <Gauge className="mr-1.5 w-3.5 h-3.5" /> View Network Stats
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {violationCount > 0 && (
                <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-2">
                  <div className="text-xs font-bold text-destructive flex items-center gap-1.5">
                    <ShieldAlert className="w-4.5 h-4.5 animate-bounce-short" /> Integrity Flagged
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                    This room has recorded {violationCount} integrity violations (e.g. browser tab switches, exit fullscreen). Review candidate logs with caution.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
        {/* PANEL 3: Right Sidebar Panel (Always visible Participants + Chat) */}
        <section className="w-80 border-l border-border/50 dark:border-white/5 bg-card/45 dark:bg-[#111612]/45 backdrop-blur-xl flex flex-col shrink-0 h-full overflow-hidden select-none" aria-label="Room details panel">
          {/* Top Half: Participants */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-border/50 dark:border-white/5">
            <div className="h-12 flex items-center justify-between px-4 border-b border-border/50 dark:border-white/5 bg-background/20 dark:bg-muted/30 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Participants</span>
              <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                {participants.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {participants.map((p) => {
                const hasHand = raisedHands[p.userId];
                return (
                  <div
                    key={p.userId}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 select-none ${
                      p.isLocal
                        ? "bg-primary/5 border-primary/25 dark:bg-primary/10 dark:border-primary/35"
                        : "bg-secondary/35 dark:bg-muted/40 border-border/30 dark:border-white/5 hover:border-primary/25 hover:bg-secondary/55 dark:hover:bg-muted/65"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/15 to-primary/5 dark:from-primary/30 dark:to-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold shadow-sm shrink-0">
                        {getInitials(p.userName)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold truncate flex items-center gap-1.5">
                          {p.userName}
                          {hasHand && <span className="animate-bounce text-xs" title="Hand Raised">✋</span>}
                        </span>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{p.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.micOn ? <Mic className="w-3.5 h-3.5 text-primary" /> : <MicOff className="w-3.5 h-3.5 text-destructive" />}
                      {p.camOn ? <VideoIcon className="w-3.5 h-3.5 text-primary" /> : <VideoOff className="w-3.5 h-3.5 text-destructive" />}

                      {/* Interviewer moderate buttons for other participants */}
                      {identity.role === "interviewer" && !p.isLocal && (
                        <div className="flex gap-1.5 ml-1.5">
                          <button
                            onClick={() => handleToggleParticipantCamera(p.userId)}
                            className="w-6 h-6 rounded-lg bg-secondary/50 dark:bg-muted/70 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 dark:hover:bg-rose-500/20 text-muted-foreground border border-border/40 dark:border-white/10 flex items-center justify-center transition-all duration-200"
                            title="Toggle Camera Off"
                          >
                            <VideoOff className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveParticipant(p.userId)}
                            className="w-6 h-6 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 hover:text-rose-600 border border-rose-500/20 hover:border-rose-500/40 flex items-center justify-center transition-all duration-200"
                            title="Kick Participant"
                          >
                            <X className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Half: Chat */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="h-12 flex items-center justify-between px-4 border-b border-border/50 dark:border-white/5 bg-background/20 dark:bg-muted/30 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chat Room</span>
              <div className="w-1.5 h-1.5 rounded-full room-pulse-green" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} currentUserName={identity.userName} currentUserId={identity.userId} />
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-border/50 dark:border-white/5 bg-background/30 backdrop-blur-md">
              <div className="relative group">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value.slice(0, 500))}
                  placeholder="Type message..."
                  className="pr-10 bg-secondary/40 dark:bg-[#111612]/60 border-border/60 dark:border-white/5 focus-visible:ring-primary h-9.5 rounded-xl text-xs focus-visible:border-primary placeholder:text-muted-foreground/60"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="absolute right-1 top-1 h-7.5 w-7.5 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* Centered Floating Control Bar overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-card/75 dark:bg-[#111612]/85 backdrop-blur-xl px-5 py-3 rounded-2xl border border-primary/20 dark:border-primary/30 shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] select-none w-max max-w-[95vw] overflow-x-auto">

        {/* Mic Button */}
        <Button
          onClick={handleToggleMic}
          variant="ghost"
          size="icon"
          className={`w-10 h-10 rounded-xl transition-all duration-300 active:scale-90 hover:scale-105 shrink-0 ${
            micOn
              ? "bg-secondary/50 dark:bg-muted/70 text-foreground border border-border/40 dark:border-white/5 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/25 dark:hover:text-primary"
              : "bg-rose-500/15 text-rose-600 border border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30"
          }`}
          title={micOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {micOn ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
        </Button>

        {/* Camera Button */}
        <Button
          onClick={handleToggleCam}
          variant="ghost"
          size="icon"
          className={`w-10 h-10 rounded-xl transition-all duration-300 active:scale-90 hover:scale-105 shrink-0 ${
            camOn
              ? "bg-secondary/50 dark:bg-muted/70 text-foreground border border-border/40 dark:border-white/5 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/25 dark:hover:text-primary"
              : "bg-rose-500/15 text-rose-600 border border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30"
          }`}
          title={camOn ? "Turn Camera Off" : "Turn Camera On"}
        >
          {camOn ? <VideoIcon className="w-4.5 h-4.5" /> : <VideoOff className="w-4.5 h-4.5" />}
        </Button>

        {/* Screen Share Button */}
        <Button
          onClick={handleToggleScreenShare}
          variant="ghost"
          size="icon"
          className={`w-10 h-10 rounded-xl transition-all duration-300 active:scale-90 hover:scale-105 shrink-0 ${
            isSharingScreen
              ? "bg-primary/20 text-primary border border-primary/30 dark:bg-primary/30 dark:text-primary-foreground dark:border-primary/45 shadow-sm"
              : "bg-secondary/50 dark:bg-muted/70 text-foreground border border-border/40 dark:border-white/5 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/25 dark:hover:text-primary"
          }`}
          title={isSharingScreen ? "Stop Screen Share" : "Share Screen"}
        >
          <Monitor className="w-4.5 h-4.5" />
        </Button>

        {/* Raise Hand Button */}
        <Button
          onClick={() => {
            const nextState = !raisedHands[identity.userId];
            setRaisedHands(prev => ({ ...prev, [identity.userId]: nextState }));
            socketRef.current?.emit("room:control", {
              roomId,
              action: "raise-hand",
              targetUserId: identity.userId,
              value: nextState,
            });
          }}
          variant="ghost"
          size="icon"
          className={`w-10 h-10 rounded-xl transition-all duration-300 active:scale-90 hover:scale-105 shrink-0 ${
            raisedHands[identity.userId]
              ? "bg-amber-500/15 text-amber-600 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 shadow-sm"
              : "bg-secondary/50 dark:bg-muted/70 text-foreground border border-border/40 dark:border-white/5 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/25 dark:hover:text-primary"
          }`}
          title="Raise Hand"
        >
          <span className="text-sm">✋</span>
        </Button>

        {/* Interviewer Extra Moderation Controls inside Control Bar */}
        {identity.role === "interviewer" && (
          <div className="h-6 w-[1px] bg-border/40 dark:bg-white/10 mx-1.5 self-center shrink-0" />
        )}

        {identity.role === "interviewer" && (
          <>
            {/* Lock Room */}
            <Button
              onClick={handleToggleLock}
              variant="ghost"
              size="icon"
              className={`w-10 h-10 rounded-xl transition-all duration-300 active:scale-90 hover:scale-105 shrink-0 ${
                roomLocked
                  ? "bg-amber-500/15 text-amber-600 border border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 shadow-sm"
                  : "bg-secondary/50 dark:bg-muted/70 text-foreground border border-border/40 dark:border-white/5 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/25 dark:hover:text-primary"
              }`}
              title={roomLocked ? "Unlock Room" : "Lock Room"}
            >
              {roomLocked ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4" />}
            </Button>

            {/* Copy Meeting Link */}
            <Button
              onClick={handleCopyLink}
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-xl bg-secondary/50 dark:bg-muted/70 text-foreground border border-border/40 dark:border-white/5 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/25 dark:hover:text-primary transition-all duration-300 active:scale-90 hover:scale-105 shrink-0"
              title="Copy Meeting Link"
            >
              <Copy className="w-4 h-4" />
            </Button>

            {/* Mute All Candidates */}
            <Button
              onClick={handleMuteAll}
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30 transition-all duration-300 active:scale-90 hover:scale-105 shrink-0"
              title="Mute All Candidates"
            >
              <VolumeX className="w-4 h-4" />
            </Button>
          </>
        )}

        <div className="h-6 w-[1px] bg-border/40 dark:bg-white/10 mx-1.5 self-center shrink-0" />

        {/* End Call Button */}
        <Button
          size="sm"
          variant="ghost"
          className="h-10 text-xs font-bold px-4 bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/15 dark:bg-rose-500 dark:text-black dark:hover:bg-rose-400 active:scale-[0.96] hover:scale-105 transition-all duration-300 rounded-xl flex items-center gap-1.5 shrink-0"
          aria-label="End interview session"
          onClick={() => setShowEndSessionConfirm(true)}
        >
          <PhoneOff className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">End Session</span>
        </Button>
      </div>

      {/* Connection Statistics Modal Overlay */}
      <AnimatePresence>
        {showStatsModal && (
          <>
            <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 select-none" onClick={() => setShowStatsModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] sm:w-[500px] max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border select-none">
                <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary animate-pulse" /> WebRTC Peer Connection Stats
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-secondary"
                  onClick={() => setShowStatsModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 py-4 space-y-4 overflow-y-auto">
                {Object.keys(statsData).length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground italic select-none">
                    No active WebRTC peer connections or statistics.
                  </div>
                ) : (
                  Object.entries(statsData).map(([userId, statsList]) => {
                    const u = connectedUsers.find((entry) => String(entry.userId) === String(userId));
                    return (
                      <div key={userId} className="border border-border rounded-xl p-3 bg-secondary/10">
                        <div className="font-bold text-xs mb-3 text-primary truncate border-b border-border/50 pb-1.5 select-none">
                          Connection: {u?.userName || userId} ({u?.role || "candidate"})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] sm:text-[11px]">
                          {statsList.map((stat, i) => {
                            if (stat.kind === "network") {
                              return (
                                <div key={i} className="col-span-1 sm:col-span-2 grid grid-cols-3 gap-2 bg-secondary/40 p-2.5 rounded-lg border border-border/30 select-none">
                                  <div className="flex flex-col"><span className="text-[9px] uppercase font-bold text-muted-foreground">RTT</span><span className="font-semibold text-foreground">{stat.currentRoundTripTime ? `${(stat.currentRoundTripTime * 1000).toFixed(0)} ms` : "N/A"}</span></div>
                                  <div className="flex flex-col"><span className="text-[9px] uppercase font-bold text-muted-foreground">Bitrate In</span><span className="font-semibold text-foreground">{stat.availableIncomingBitrate ? `${(stat.availableIncomingBitrate / 1024).toFixed(0)} kbps` : "N/A"}</span></div>
                                  <div className="flex flex-col"><span className="text-[9px] uppercase font-bold text-muted-foreground">Bitrate Out</span><span className="font-semibold text-foreground">{stat.availableOutgoingBitrate ? `${(stat.availableOutgoingBitrate / 1024).toFixed(0)} kbps` : "N/A"}</span></div>
                                </div>
                              );
                            }
                            return (
                              <div key={i} className="bg-background border border-border/50 p-2.5 rounded-lg flex flex-col gap-1 shadow-sm select-none">
                                <div className="font-bold text-[9px] uppercase text-muted-foreground tracking-wider border-b border-border/20 pb-0.5 mb-1">{stat.kind} {stat.bytesReceived ? "Inbound" : "Outbound"}</div>
                                {stat.bytesReceived !== undefined && (
                                  <>
                                    <div className="flex justify-between"><span>Bytes Recv:</span><span className="font-mono font-medium">{(stat.bytesReceived / 1024).toFixed(1)} KB</span></div>
                                    <div className="flex justify-between"><span>Packets Recv:</span><span className="font-mono font-medium">{stat.packetsReceived}</span></div>
                                    <div className="flex justify-between"><span>Packets Lost:</span><span className={`font-mono font-bold ${stat.packetsLost > 0 ? "text-destructive" : "text-emerald-600"}`}>{stat.packetsLost}</span></div>
                                  </>
                                )}
                                {stat.bytesSent !== undefined && (
                                  <>
                                    <div className="flex justify-between"><span>Bytes Sent:</span><span className="font-mono font-medium">{(stat.bytesSent / 1024).toFixed(1)} KB</span></div>
                                    <div className="flex justify-between"><span>Packets Sent:</span><span className="font-mono font-medium">{stat.packetsSent}</span></div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-border gap-2 select-none">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-semibold rounded-xl border-border bg-background hover:bg-secondary active:scale-95 transition-all"
                  onClick={fetchConnectionStats}
                >
                  Refresh
                </Button>
                <Button
                  size="sm"
                  className="text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
                  onClick={() => setShowStatsModal(false)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </>
        )}

        {/* Interviewer End Session Modal */}
        {showEndSessionConfirm && identity.role === "interviewer" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
              onClick={() => setShowEndSessionConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] sm:w-[450px] bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-2xl z-50 flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2 text-center select-none">
                <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2 animate-pulse-glow">
                  <PhoneOff className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">End Interview Session?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Decide how you'd like to exit. Ending the session will disconnect the candidate and proceed to feedback submission.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleOfficialEndSession}
                  className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl py-5 text-xs font-semibold shadow-lg shadow-destructive/15 active:scale-[0.98] transition-all"
                >
                  End Session for All & Submit Feedback
                </Button>
                <Button
                  onClick={handleLeaveRoom}
                  variant="outline"
                  className="w-full border-border bg-transparent hover:bg-secondary rounded-xl py-5 text-xs font-semibold active:scale-[0.98] transition-all"
                >
                  Leave Session Temporarily
                </Button>
                <Button
                  onClick={() => setShowEndSessionConfirm(false)}
                  variant="ghost"
                  className="w-full hover:bg-transparent text-muted-foreground hover:text-foreground text-xs font-semibold py-2"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </>
        )}

        {/* Candidate Leave Session Modal */}
        {showEndSessionConfirm && identity.role === "candidate" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
              onClick={() => setShowEndSessionConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] sm:w-[420px] bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-2xl z-50 flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2 text-center select-none">
                <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center mx-auto mb-2">
                  <PhoneOff className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Leave Interview Room?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to exit? You will be disconnected from the video call.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowEndSessionConfirm(false)}
                  variant="outline"
                  className="flex-1 border-border bg-transparent hover:bg-secondary rounded-xl py-5 text-xs font-semibold active:scale-[0.98] transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLeaveRoom}
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl py-5 text-xs font-semibold shadow-lg shadow-destructive/15 active:scale-[0.98] transition-all"
                >
                  Leave
                </Button>
              </div>
            </motion.div>
          </>
        )}

        {/* Candidate Session Ended (Forced Kick) Modal */}
        {isSessionEndedAlert && (
          <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 animate-fade-in" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] sm:w-[460px] bg-card border border-border p-8 rounded-2xl shadow-2xl z-50 flex flex-col items-center gap-6 text-center select-none"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-pulse">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-foreground">Interview Session Finished</h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  The interviewer has officially concluded this session. Thank you for your time!
                </p>
              </div>

              <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-xl border border-border/60">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-xs font-semibold text-muted-foreground">
                  Redirecting to dashboard in {redirectCountdown}s...
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
