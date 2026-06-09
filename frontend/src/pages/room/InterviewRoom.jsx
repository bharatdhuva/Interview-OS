import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import {
  Mic,
  MicOff,
  Brain,
  Video as VideoIcon,
  VideoOff,
  Monitor,
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
  MessageSquare
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
import WhiteboardPanel from "@/components/room/WhiteboardPanel";
import api from "@/lib/api";
import { io } from "socket.io-client";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const defaultCode = {
  javascript: `// Two Sum Problem\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\n// Test\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
  typescript: `// Two Sum Problem\nfunction twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
  python: `# Two Sum Problem\ndef two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))`,
  java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[]{map.get(complement), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
  cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> map;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (map.count(complement)) {\n                return {map[complement], i};\n            }\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
  go: `package main\n\nimport "fmt"\n\nfunc twoSum(nums []int, target int) []int {\n    m := make(map[int]int)\n    for i, num := range nums {\n        complement := target - num\n        if j, ok := m[complement]; ok {\n            return []int{j, i}\n        }\n        m[num] = i\n    }\n    return nil\n}\n\nfunc main() {\n    fmt.Println(twoSum([]int{2, 7, 11, 15}, 9))\n}`,
  rust: `use std::collections::HashMap;\n\nfn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n    let mut map = HashMap::new();\n    for (i, &num) in nums.iter().enumerate() {\n        let complement = target - num;\n        if let Some(&j) = map.get(&complement) {\n            return vec![j as i32, i as i32];\n        }\n        map.insert(num, i);\n    }\n    vec![]\n}\n\nfn main() {\n    println!("{:?}", two_sum(vec![2, 7, 11, 15], 9));\n}`,
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
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

const VideoTile = ({ participant, isLocal, localVideoRef }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-2xl bg-[#eceeec] dark:bg-[#182219] border border-border/80 overflow-hidden flex flex-col shadow-md hover:shadow-lg transition-all duration-300 w-full h-full min-h-[160px] aspect-[4/3]"
    >
      {/* Top bar indicators inside tile */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/40 to-transparent p-3 flex items-center justify-between z-10">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400/80 inline-block" />
          <span className="w-2 h-2 rounded-full bg-yellow-400/80 inline-block" />
          <span className="w-2 h-2 rounded-full bg-green-400/80 inline-block" />
        </div>
        {!participant.micOn && (
          <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center text-white shadow-md">
            <MicOff className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

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

        {!participant.camOn && (
          <div className="flex flex-col items-center justify-center z-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#0d631b] to-[#2e7d32] dark:from-[#88d982] dark:to-[#307231] flex items-center justify-center text-white dark:text-[#00390a] text-lg sm:text-xl font-bold shadow-md">
              {getInitials(participant.userName)}
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase mt-2 tracking-wider">
              Camera Off
            </span>
          </div>
        )}
      </div>

      {/* Participant Name Pill */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[9px] sm:text-[10px] text-white font-medium flex items-center gap-1.5 z-10">
        <span className="truncate max-w-[90px] sm:max-w-[120px]">{participant.userName}</span>
        <Badge variant="secondary" className="text-[8px] sm:text-[9px] px-1 py-0 h-4 bg-white/20 text-white border-0 hover:bg-white/20 select-none">
          {participant.role}
        </Badge>
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
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {msg.sender}
        </span>
        <span className="text-[10px] text-muted-foreground/60">{msg.time}</span>
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs sm:text-sm ${
          isOwnMessage
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-secondary text-secondary-foreground rounded-tl-none"
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

  // Mode: 'editor' or 'whiteboard'
  const [activeTab, setActiveTab] = useState("editor");
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

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

  const { violationCount, enterFullscreen } = useProctor({
    roomId,
  });

  const [language, setLanguage] = useState("typescript");
  const [codeByLanguage, setCodeByLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(editorStorageKey);
      if (!saved) return { ...defaultCode };
      const parsed = JSON.parse(saved);
      return {
        ...defaultCode,
        ...(parsed.codeByLanguage || {}),
      };
    } catch {
      return { ...defaultCode };
    }
  });

  const [code, setCode] = useState(defaultCode.typescript);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [timer, setTimer] = useState(3600);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(3600);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [roomTitle, setRoomTitle] = useState("Interview Room");
  const [messages, setMessages] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const chatEndRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);
  
  // Custom states and refs for multi-peer/redesign
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const readySignalSentRef = useRef(false);
  const peerConnectionsRef = useRef({}); // userId -> RTCPeerConnection
  const screenStreamRef = useRef(null);

  const [remoteStreams, setRemoteStreams] = useState({}); // userId -> MediaStream
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [roomLocked, setRoomLocked] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [statsData, setStatsData] = useState({});
  const [showStatsModal, setShowStatsModal] = useState(false);

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
        setMicOn(stream.getAudioTracks().some((track) => track.enabled));
        setCamOn(stream.getVideoTracks().some((track) => track.enabled));
        announceReadyIfPossible();
      } catch {
        setMicOn(false);
        setCamOn(false);
        toast({
          title: "Media access denied",
          description: "Camera and microphone access is required for live interview calls.",
          variant: "destructive",
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
  }, [announceReadyIfPossible, cleanupAllPeerConnections, toast]);

  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) return;
      try {
        const response = await api.get(`/rooms/${roomId}`);
        if (response.data.data?.title) {
          setRoomTitle(response.data.data.title);
        }
        const room = response.data.data;
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
    setCode(codeByLanguage[language] ?? defaultCode[language] ?? "");
  }, [language, codeByLanguage]);

  useEffect(() => {
    if (!roomId) return;

    const socket = io(getSocketServerUrl(), {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;

    const onConnect = () => {
      socket.emit("room:join", {
        roomId,
        userId: identity.userId,
        role: identity.role,
        userName: identity.userName,
        micOn,
        camOn,
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
          startOffer(remoteUser.userId).catch(() => {});
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

    const onUserReady = ({ userId }) => {
      if (!userId || String(userId) === String(identity.userId)) return;
      const shouldInitiate = String(identity.userId) > String(userId);
      if (shouldInitiate) {
        startOffer(userId).catch(() => {});
      }
    };

    const onOffer = async ({ offer, fromUserId }) => {
      if (!offer || !fromUserId || String(fromUserId) === String(identity.userId)) return;
      const peer = buildPeerConnection(fromUserId);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
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
      }
    };

    const onIceCandidate = async ({ candidate, fromUserId }) => {
      if (!candidate || !fromUserId) return;
      const pc = peerConnectionsRef.current[fromUserId];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {
          // ignore
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

    const onRoomControl = ({ action, targetUserId }) => {
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
      }
    };

    socket.on("connect", onConnect);
    socket.on("room:user-list", onUserList);
    socket.on("chat:message", onChatMessage);
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
      socket.off("webrtc:user-ready", onUserReady);
      socket.off("webrtc:offer", onOffer);
      socket.off("webrtc:answer", onAnswer);
      socket.off("webrtc:ice-candidate", onIceCandidate);
      socket.off("webrtc:call-end", onCallEnd);
      socket.off("room:media-toggle", onMediaToggle);
      socket.off("room:control", onRoomControl);
      socket.disconnect();
      socketRef.current = null;
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
  ]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

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
            codeByLanguage,
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
    [codeByLanguage, editorStorageKey, language, roomId, toast]
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
    if (!code.trim()) {
      setOutput("Please write some code before running.\n");
      return;
    }
    setIsRunning(true);
    setOutput(`Running ${language} code...\n`);
    try {
      const sessionId = sessionStorage.getItem(roomSessionKey) || undefined;
      const response = await api.post(`/rooms/${roomId}/code/execute`, {
        roomId,
        language,
        code,
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
    setCode(nextCode);
    setCodeByLanguage((prev) => (prev[language] === nextCode ? prev : { ...prev, [language]: nextCode }));
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
    socketRef.current?.emit("webrtc:call-end", {
      roomId,
      fromUserId: identity.userId,
    });
    cleanupAllPeerConnections();
    navigate("/");
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

  useEffect(() => {
    let interval;
    if (showStatsModal) {
      fetchConnectionStats();
      interval = setInterval(fetchConnectionStats, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showStatsModal]);

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

  const renderVideoGrid = () => {
    const len = participants.length;
    if (len === 1) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-0 w-full h-full p-2">
          <div className="w-full max-w-sm sm:max-w-md aspect-[4/3]">
            <VideoTile participant={participants[0]} isLocal={true} localVideoRef={localVideoRef} />
          </div>
        </div>
      );
    }
    if (len === 2) {
      return (
        <div className="flex-1 grid grid-cols-1 gap-4 items-center justify-center min-h-0 w-full h-full p-2">
          {participants.map((p) => (
            <VideoTile key={p.userId} participant={p} isLocal={p.isLocal} localVideoRef={localVideoRef} />
          ))}
        </div>
      );
    }
    if (len === 3) {
      return (
        <div className="flex-1 flex flex-col gap-4 justify-center min-h-0 w-full h-full p-2">
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <VideoTile participant={participants[0]} isLocal={participants[0].isLocal} localVideoRef={localVideoRef} />
            <VideoTile participant={participants[1]} isLocal={participants[1].isLocal} localVideoRef={localVideoRef} />
          </div>
          <div className="flex justify-center flex-1 min-h-0">
            <div className="w-1/2 min-w-[160px]">
              <VideoTile participant={participants[2]} isLocal={participants[2].isLocal} localVideoRef={localVideoRef} />
            </div>
          </div>
        </div>
      );
    }
    // 4 or more participants
    return (
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 min-h-0 w-full h-full p-2">
        {participants.slice(0, 4).map((p) => (
          <VideoTile key={p.userId} participant={p} isLocal={p.isLocal} localVideoRef={localVideoRef} />
        ))}
      </div>
    );
  };

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
      <header className="sticky top-0 border-b border-border bg-card/80 backdrop-blur-md flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 sm:px-4 lg:px-6 py-2 lg:h-16 shrink-0 z-30 gap-2 select-none">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 w-full lg:w-auto">
          <Link to="/" className="group flex items-center gap-2 cursor-pointer select-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0d631b] to-[#2e7d32] dark:from-[#88d982] dark:to-[#307231] flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Terminal className="w-4 h-4 text-white dark:text-[#00390a]" />
            </div>
            <span className="font-bold tracking-tight text-base sm:text-lg text-primary">
              InterviewOS
            </span>
          </Link>
          <div className="h-6 w-[1px] bg-border mx-1 sm:mx-2 hidden sm:block" />
          <div className="hidden sm:flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-semibold truncate">
              {roomTitle}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              {roomId}
            </span>
          </div>
        </div>

        <div className="w-full lg:w-auto flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 justify-end">
          <Badge
            variant={isOnline ? "secondary" : "destructive"}
            className="h-7 px-2.5 text-[11px] font-semibold"
            aria-live="polite"
          >
            {isOnline ? (
              <Wifi className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <WifiOff className="mr-1.5 h-3.5 w-3.5" />
            )}
            {isOnline ? "Connected" : "Offline"}
          </Badge>

          {/* Proctoring Status Pill */}
          <div
            className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border text-[11px] sm:text-xs font-medium transition-colors ${
              violationCount > 0
                ? "bg-destructive/10 border-destructive/20 text-destructive animate-pulse"
                : "bg-primary/10 border-primary/20 text-primary"
            }`}
          >
            {violationCount > 0 ? (
              <ShieldAlert className="w-3.5 h-3.5 animate-bounce-short" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>Proctoring:</span>{" "}
            {violationCount > 0 ? `${violationCount} Violations` : "Secure"}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono bg-secondary/50 px-2.5 sm:px-3 py-1 rounded-md border border-border">
            <Clock className="w-4 h-4 text-primary" />
            <span className={timer < 300 ? "text-destructive font-bold animate-pulse" : "text-foreground"}>
              {formatTime(timer)}
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-2 min-w-40">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <Progress value={sessionProgress} className="h-2" aria-label="Session progress" />
            <span className="text-[11px] text-muted-foreground tabular-nums w-9 text-right">
              {sessionProgress}%
            </span>
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

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Section: Monaco Editor / Whiteboard & Console */}
        <main className="flex-1 flex flex-col min-w-0 bg-card/10 relative min-h-[360px] lg:min-h-0">
          {/* Toolbar */}
          <div className="border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-4 py-2 sm:py-2 gap-2 shrink-0 bg-background/60 backdrop-blur-md lg:h-12 lg:py-0 select-none">
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border">
              <button
                onClick={() => setActiveTab("editor")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === "editor"
                    ? "bg-background text-primary shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Editor
              </button>
              <button
                onClick={() => setActiveTab("whiteboard")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === "whiteboard"
                    ? "bg-background text-primary shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                Whiteboard
              </button>
            </div>

            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              {activeTab === "editor" && (
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-8 w-28 sm:w-32 bg-secondary/50 border-border text-[11px] font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.value} value={l.value} className="text-xs">
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex items-center flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-[11px] gap-1.5 hover:bg-secondary active:scale-95 transition-all duration-200"
                  onClick={handleManualSave}
                  disabled={isSaving}
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-[11px] gap-1.5 hover:bg-primary/10 hover:text-primary active:scale-95 transition-all duration-200"
                >
                  <Brain className="w-3.5 h-3.5" /> AI Review
                </Button>
                {activeTab === "editor" && (
                  <span className="hidden md:inline text-[10px] text-muted-foreground">
                    {lastSavedAt ? `Saved ${lastSavedAt}` : "Not saved yet"}
                  </span>
                )}
                {activeTab === "editor" && (
                  <Button
                    size="sm"
                    className="h-8 text-[11px] gap-1.5 bg-primary hover:bg-primary/90 hover:scale-[1.03] active:scale-95 transition-all duration-200 shadow-md shadow-primary/20"
                    onClick={handleRun}
                    disabled={isRunning}
                  >
                    <Play className="w-3.5 h-3.5" />
                    {isRunning ? "Running..." : "Run Code"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "editor" ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      language={language}
                      theme={isDark ? "vs-dark" : "light"}
                      value={code}
                      onChange={handleCodeChange}
                      options={{
                        fontSize: 14,
                        fontFamily: '"JetBrains Mono", monospace',
                        minimap: { enabled: false },
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        cursorBlinking: "smooth",
                        lineNumbers: "on",
                        renderLineHighlight: "all",
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                        bracketPairColorization: { enabled: true },
                        smoothScrolling: true,
                      }}
                    />
                  </div>
                  {/* Console */}
                  <div className="h-40 border-t border-border bg-card/50 flex flex-col select-none">
                    <div className="h-8 px-4 flex items-center justify-between border-b border-border bg-background/30">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                          Output Console
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] hover:bg-secondary active:scale-95 transition-all"
                        onClick={() => setOutput("")}
                      >
                        Clear
                      </Button>
                    </div>
                    <pre className="flex-1 p-4 pb-24 font-mono text-xs overflow-auto bg-black/[0.03] dark:bg-black/30 text-foreground/95 leading-relaxed selection:bg-primary/20">
                      {output || (
                        <span className="text-muted-foreground/40 italic">
                          Execute code to see results...
                        </span>
                      )}
                    </pre>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="whiteboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full bg-background"
                >
                  <WhiteboardPanel isDark={isDark} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Right Section: Video Call Grid */}
        <aside className="w-full lg:w-[450px] border-t lg:border-t-0 lg:border-l border-border bg-card/10 bg-room-dot-pattern flex flex-col p-4 gap-4 shrink-0 overflow-y-auto relative pb-28">
          <div className="flex items-center justify-between border-b border-border pb-2 select-none">
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Video Call Grid
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              {participants.length} {participants.length === 1 ? "User" : "Users"}
            </div>
          </div>

          {/* Dynamic Grid Layout container */}
          <AnimatePresence mode="wait">
            {renderVideoGrid()}
          </AnimatePresence>
        </aside>

        {/* Slide-in Chat panel */}
        <AnimatePresence>
          {showChat && (
            <motion.section
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="absolute right-0 top-0 bottom-0 w-80 border-l border-border bg-background/95 backdrop-blur-md shadow-2xl flex flex-col z-40"
              aria-label="Interview chat panel"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0 select-none">
                <span className="text-sm font-bold tracking-tight">Messaging</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full room-pulse-green" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-secondary"
                    onClick={() => setShowChat(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="px-4 pt-3 select-none">
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
                  Messages are time-stamped and retained for room history.
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                aria-live="polite"
                aria-relevant="additions text"
              >
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    currentUserName={identity.userName}
                    currentUserId={identity.userId}
                  />
                ))}
                <div ref={chatEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-border bg-background/50 backdrop-blur-sm select-none"
              >
                <div className="relative group">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value.slice(0, 500))}
                    placeholder="Message..."
                    aria-label="Type your message"
                    className={`pr-12 bg-secondary/50 border-border focus-visible:ring-primary h-11 rounded-xl transition-all ${
                      chatInput.length >= 500 ? "!border-destructive" : ""
                    }`}
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || chatInput.trim().length > 500}
                    className="absolute right-2 top-1.5 h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100 transition-all active:scale-95 shadow-lg shadow-primary/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground/60">Press Enter to send</span>
                  <span
                    className={`text-[10px] ${
                      chatInput.length >= 450
                        ? chatInput.length >= 500
                          ? "text-destructive font-semibold"
                          : "text-amber-500 font-medium"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    {chatInput.length}/500
                  </span>
                </div>
              </form>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Centered Bottom Control Bar */}
      <div className="absolute bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex items-center justify-between gap-6 bg-card/95 backdrop-blur-md px-4 sm:px-6 py-3 rounded-2xl border border-border shadow-xl w-auto md:w-[600px] select-none">
        
        {/* Controls block (Centered on the bar) */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 justify-center md:justify-start">
          {/* Mic Button */}
          <Button
            onClick={handleToggleMic}
            variant={micOn ? "secondary" : "destructive"}
            size="icon"
            className={`w-10 h-10 rounded-xl transition-all duration-200 active:scale-90 ${
              micOn ? "bg-secondary text-foreground hover:bg-secondary/80" : "animate-pulse-slow"
            }`}
            title={micOn ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micOn ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
          </Button>

          {/* Camera Button */}
          <Button
            onClick={handleToggleCam}
            variant={camOn ? "secondary" : "destructive"}
            size="icon"
            className={`w-10 h-10 rounded-xl transition-all duration-200 active:scale-90 ${
              camOn ? "bg-secondary text-foreground hover:bg-secondary/80" : "animate-pulse-slow"
            }`}
            title={camOn ? "Turn Camera Off" : "Turn Camera On"}
          >
            {camOn ? <VideoIcon className="w-4.5 h-4.5" /> : <VideoOff className="w-4.5 h-4.5" />}
          </Button>

          {/* Screen Share Button */}
          <Button
            onClick={handleToggleScreenShare}
            variant={isSharingScreen ? "default" : "secondary"}
            size="icon"
            className={`w-10 h-10 rounded-xl transition-all duration-200 active:scale-90 ${
              isSharingScreen ? "bg-primary text-primary-foreground hover:bg-primary/95" : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
            title={isSharingScreen ? "Stop Sharing Screen" : "Share Screen"}
          >
            <Monitor className="w-4.5 h-4.5" />
          </Button>

          {/* Participants Badge */}
          <div className="relative">
            <Button
              variant="secondary"
              size="icon"
              className="w-10 h-10 rounded-xl bg-secondary text-foreground hover:bg-secondary cursor-default"
              title="Participants count"
            >
              <Users className="w-4.5 h-4.5" />
            </Button>
            <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-background shadow">
              {participants.length}
            </span>
          </div>

          {/* Chat Panel Trigger */}
          <Button
            onClick={() => setShowChat(!showChat)}
            variant={showChat ? "default" : "secondary"}
            size="icon"
            className={`w-10 h-10 rounded-xl transition-all duration-200 active:scale-90 ${
              showChat ? "bg-primary text-primary-foreground hover:bg-primary/95" : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
            title="Toggle Chat"
          >
            <MessageSquare className="w-4.5 h-4.5" />
          </Button>

          {/* Interviewer Extra MenuDropdown */}
          {identity.role === "interviewer" && (
            <div className="relative">
              <Button
                variant="outline"
                className="h-10 px-3.5 text-xs font-semibold gap-1 rounded-xl border-border bg-background hover:bg-secondary active:scale-95 transition-all select-none"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                More <ChevronDown className="w-3.5 h-3.5" />
              </Button>

              <AnimatePresence>
                {showMoreMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      className="absolute bottom-12 left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl border border-border bg-popover p-2 shadow-2xl z-50 flex flex-col gap-1 text-popover-foreground select-none"
                    >
                      <button
                        onClick={() => {
                          handleCopyLink();
                          setShowMoreMenu(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-left text-xs font-semibold rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Copy Room Link
                      </button>

                      <button
                        onClick={() => {
                          handleMuteAll();
                          setShowMoreMenu(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-left text-xs font-semibold rounded-lg hover:bg-secondary text-destructive hover:text-destructive transition-colors"
                      >
                        <VolumeX className="w-3.5 h-3.5" /> Mute All Participants
                      </button>

                      <button
                        onClick={() => {
                          handleToggleLock();
                          setShowMoreMenu(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-left text-xs font-semibold rounded-lg hover:bg-secondary transition-colors"
                      >
                        {roomLocked ? (
                          <Unlock className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        {roomLocked ? "Unlock Room" : "Lock Room"}
                      </button>

                      <button
                        onClick={() => {
                          fetchConnectionStats();
                          setShowStatsModal(true);
                          setShowMoreMenu(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-left text-xs font-semibold rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Gauge className="w-3.5 h-3.5 text-muted-foreground" /> Connection Stats
                      </button>

                      {/* Participant Management list */}
                      {connectedUsers.filter((u) => String(u.userId) !== String(identity.userId)).length > 0 && (
                        <>
                          <div className="h-[1px] bg-border my-1" />
                          <div className="px-3 py-1 text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
                            Manage Users
                          </div>
                          {connectedUsers
                            .filter((u) => String(u.userId) !== String(identity.userId))
                            .map((u) => (
                              <div key={u.userId} className="flex flex-col gap-1.5 p-1 bg-secondary/20 rounded-lg mb-1">
                                <div className="px-2 text-[10px] font-bold truncate text-foreground/80">
                                  {u.userName}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      handleToggleParticipantCamera(u.userId);
                                      setShowMoreMenu(false);
                                    }}
                                    className="flex-1 flex justify-center py-1 text-[9px] font-bold rounded bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border/50"
                                  >
                                    Cam Off
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleRemoveParticipant(u.userId);
                                      setShowMoreMenu(false);
                                    }}
                                    className="flex-1 flex justify-center py-1 text-[9px] font-bold rounded bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors border border-destructive/20"
                                  >
                                    Kick
                                  </button>
                                </div>
                              </div>
                            ))}
                        </>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* End Call Button on the right side */}
        <div className="flex-none">
          <Button
            size="sm"
            variant="destructive"
            className="h-10 text-xs font-semibold px-4 shadow-lg shadow-destructive/20 active:scale-95 transition-all duration-200 rounded-xl"
            aria-label="End interview session"
            onClick={handleEndCall}
          >
            End Session
          </Button>
        </div>
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
      </AnimatePresence>
    </div>
  );
}
