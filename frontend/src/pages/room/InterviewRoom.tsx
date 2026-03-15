import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  PhoneOff,
  Send,
  Clock,
  Terminal,
  Users,
  PenTool,
  Code2,
  AlertTriangle,
  Maximize2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import ThemeToggle from "@/components/ThemeToggle";
import { EditorPanel } from "@/components/editor";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const defaultCode: Record<string, string> = {
  javascript: `// Two Sum Problem\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\n// Test\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
  typescript: `// Two Sum Problem\nfunction twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
  python: `# Two Sum Problem\ndef two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))`,
  java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[]{map.get(complement), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
  cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> map;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (map.count(complement)) {\n                return {map[complement], i};\n            }\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
  go: `package main\n\nimport "fmt"\n\nfunc twoSum(nums []int, target int) []int {\n    m := make(map[int]int)\n    for i, num := range nums {\n        complement := target - num\n        if j, ok := m[complement]; ok {\n            return []int{j, i}\n        }\n        m[num] = i\n    }\n    return nil\n}\n\nfunc main() {\n    fmt.Println(twoSum([]int{2, 7, 11, 15}, 9))\n}`,
  rust: `use std::collections::HashMap;\n\nfn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n    let mut map = HashMap::new();\n    for (i, &num) in nums.iter().enumerate() {\n        let complement = target - num;\n        if let Some(&j) = map.get(&complement) {\n            return vec![j as i32, i as i32];\n        }\n        map.insert(num, i);\n    }\n    vec![]\n}\n\nfn main() {\n    println!("{:?}", two_sum(vec![2, 7, 11, 15], 9));\n}`,
};

interface ChatMsg {
  id: string;
  sender: string;
  message: string;
  time: string;
}

const MessageBubble: React.FC<{ msg: ChatMsg; currentUserName?: string }> = ({
  msg,
  currentUserName,
}) => {
  return (
    <motion.div
      key={msg.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col ${msg.sender === currentUserName ? "items-end" : "items-start"} mb-3`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {msg.sender}
        </span>
        <span className="text-[10px] text-muted-foreground/60">{msg.time}</span>
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
          msg.sender === currentUserName
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-secondary text-secondary-foreground rounded-tl-none"
        }`}
      >
        {msg.message}
      </div>
    </motion.div>
  );
};

export default function InterviewRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const editorStorageKey = `interviewos:room:${roomId || "default"}:editor`;

  // Mode: 'editor' or 'whiteboard'
  const [activeTab, setActiveTab] = useState<"editor" | "whiteboard">("editor");

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );
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

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  const { violationCount, enterFullscreen } = useProctor({
    roomId,
    onEndSession: () => {
      toast({
        title: "Session Ended",
        description: "Too many violations. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => navigate("/"), 3000);
    },
  });

  const [language, setLanguage] = useState("typescript");
  const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>(
    () => {
      try {
        const saved = localStorage.getItem(editorStorageKey);
        if (!saved) return { ...defaultCode };
        const parsed = JSON.parse(saved) as {
          codeByLanguage?: Record<string, string>;
        };
        return {
          ...defaultCode,
          ...(parsed.codeByLanguage || {}),
        };
      } catch {
        return { ...defaultCode };
      }
    },
  );
  const [code, setCode] = useState(defaultCode.typescript);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [timer, setTimer] = useState(3600);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "1",
      sender: "Interviewer",
      message: "Hello! Are you ready to begin?",
      time: "2:00 PM",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const autosaveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(
      () => setTimer((t) => Math.max(0, t - 1)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setCode(codeByLanguage[language] ?? defaultCode[language] ?? "");
  }, [language, codeByLanguage]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const persistEditorState = useCallback(
    (triggeredBy: "auto" | "manual") => {
      try {
        localStorage.setItem(
          editorStorageKey,
          JSON.stringify({
            roomId,
            language,
            codeByLanguage,
            updatedAt: new Date().toISOString(),
            triggeredBy,
          }),
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
    [codeByLanguage, editorStorageKey, language, roomId, toast],
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
    const onKeyDown = (event: KeyboardEvent) => {
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
    const startedAt = performance.now();
    setOutput(`Running ${language} code...\n`);
    await new Promise((r) => setTimeout(r, 900));

    const duration = Math.max(1, Math.round(performance.now() - startedAt));
    const hasLikelyError = /\berror\b|throw\s+new|syntax/i.test(code);
    setOutput((prev) =>
      hasLikelyError
        ? `${prev}✗ Runtime failed\nDetected a possible error pattern in code.\n`
        : `${prev}> Execution completed\n✓ Finished successfully in ${duration}ms\n`,
    );
    setIsRunning(false);
  };

  const handleCodeChange = (value?: string) => {
    const nextCode = value || "";
    setCode(nextCode);
    setCodeByLanguage((prev) =>
      prev[language] === nextCode ? prev : { ...prev, [language]: nextCode },
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: user?.name || "Candidate",
        message: trimmed,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setChatInput("");
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden selection:bg-primary/30">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 sm:px-4 lg:px-6 py-2 lg:h-14 shrink-0 z-20 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 w-full lg:w-auto">
          <Link to="/" className="group flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Terminal className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold tracking-tight text-base sm:text-lg">
              InterviewOS
            </span>
          </Link>
          <div className="h-6 w-[1px] bg-border mx-1 sm:mx-2 hidden sm:block" />
          <div className="hidden sm:flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-semibold truncate">
              Backend Engineering Assessment
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              {roomId}
            </span>
          </div>
        </div>

        <div className="w-full lg:w-auto flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4">
          {/* Proctoring Status */}
          <div
            className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border text-[11px] sm:text-xs font-medium transition-colors ${
              violationCount > 0
                ? "bg-destructive/10 border-destructive/20 text-destructive"
                : "bg-success/10 border-success/20 text-success"
            }`}
          >
            {violationCount > 0 ? (
              <ShieldAlert className="w-3.5 h-3.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Proctoring:</span>{" "}
            {violationCount > 0 ? `${violationCount} Violations` : "Secure"}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono bg-secondary/50 px-2.5 sm:px-3 py-1 rounded-md border border-border">
            <Clock className="w-4 h-4 text-primary" />
            <span
              className={
                timer < 300 ? "text-destructive font-bold" : "text-foreground"
              }
            >
              {formatTime(timer)}
            </span>
          </div>

          <ThemeToggle isDark={isDark} onToggle={toggleTheme} size="sm" />

          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 gap-1.5 border border-border/50 hover:bg-secondary"
            onClick={enterFullscreen}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </Button>

          <Button
            size="sm"
            variant="destructive"
            className="h-8 text-xs font-semibold px-4 shadow-lg shadow-destructive/20"
          >
            <span className="hidden sm:inline">End Session</span>
            <span className="sm:hidden">End</span>
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden">
        {/* Left: Video & Controls (15%) */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-card/30 flex flex-col p-3 sm:p-4 gap-3 sm:gap-4 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
            {/* Interviewer Video */}
            <div className="aspect-video rounded-xl bg-secondary/80 border border-border relative overflow-hidden shadow-inner flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary/60" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                Interviewer
              </span>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-white">
                Alex Chen
              </div>
            </div>

            {/* Candidate Video */}
            <div className="aspect-video rounded-xl bg-secondary/80 border border-border relative overflow-hidden shadow-inner flex flex-col items-center justify-center">
              {!camOn ? (
                <div className="flex flex-col items-center">
                  <VideoOff className="w-8 h-8 text-muted-foreground/40 mb-2" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">
                    Camera Off
                  </span>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-t from-black/20 to-transparent flex items-center justify-center">
                  <Users className="w-10 h-10 text-success/40" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-primary/80 backdrop-blur-sm text-[10px] text-white font-medium">
                You (Candidate)
              </div>
            </div>
          </div>

          {/* Media Controls */}
          <div className="flex justify-between items-center bg-secondary/30 p-2 rounded-2xl border border-border/50">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                micOn
                  ? "bg-background hover:bg-secondary text-foreground"
                  : "bg-destructive text-destructive-foreground rotate-12"
              }`}
            >
              {micOn ? (
                <Mic className="w-4.5 h-4.5" />
              ) : (
                <MicOff className="w-4.5 h-4.5" />
              )}
            </button>
            <button
              onClick={() => setCamOn(!camOn)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                camOn
                  ? "bg-background hover:bg-secondary text-foreground"
                  : "bg-destructive text-destructive-foreground rotate-12"
              }`}
            >
              {camOn ? (
                <VideoIcon className="w-4.5 h-4.5" />
              ) : (
                <VideoOff className="w-4.5 h-4.5" />
              )}
            </button>
            <button className="w-10 h-10 rounded-xl bg-background hover:bg-secondary text-foreground flex items-center justify-center transition-all">
              <Monitor className="w-4.5 h-4.5" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-destructive/10 hover:bg-destructive text-destructive hover:text-white flex items-center justify-center transition-all group">
              <PhoneOff className="w-4.5 h-4.5 group-hover:scale-110" />
            </button>
          </div>
        </aside>

        {/* Center: Editor/Whiteboard (60%) */}
        <main className="flex-1 flex flex-col min-w-0 bg-card/20 relative min-h-[360px] lg:min-h-0">
          {/* Toolbar */}
          <div className="border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-4 py-2 sm:py-2 gap-2 shrink-0 bg-background/40 backdrop-blur-sm lg:h-12 lg:py-0">
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border">
              <button
                onClick={() => setActiveTab("editor")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === "editor"
                    ? "bg-background text-primary shadow-sm"
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
                    ? "bg-background text-primary shadow-sm"
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
                  <SelectTrigger className="h-8 w-28 sm:w-32 bg-secondary/50 border-border text-[11px] font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem
                        key={l.value}
                        value={l.value}
                        className="text-xs"
                      >
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
                  className="h-8 text-[11px] gap-1.5 hover:bg-secondary"
                  onClick={handleManualSave}
                  disabled={isSaving}
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-[11px] gap-1.5 hover:bg-primary/10 hover:text-primary"
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
                    className="h-8 text-[11px] gap-1.5 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
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
                  <div className="h-40 border-t border-border bg-card/40 flex flex-col">
                    <div className="h-8 px-4 flex items-center justify-between border-b border-border bg-background/20">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground">
                          Output Console
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setOutput("")}
                      >
                        <span className="text-[10px]">Clear</span>
                      </Button>
                    </div>
                    <pre className="flex-1 p-4 font-mono text-xs overflow-auto text-foreground/80 leading-relaxed">
                      {output || (
                        <span className="text-muted-foreground/50 italic">
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

        {/* Right: Chat (25%) */}
        <section className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card/30 flex flex-col shrink-0 max-h-[45vh] lg:max-h-none">
          <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
            <span className="text-sm font-bold tracking-tight">Messaging</span>
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                currentUserName={user?.name || "Candidate"}
              />
            ))}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-border bg-background/50 backdrop-blur-sm"
          >
            <div className="relative group">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value.slice(0, 500))}
                placeholder="Message interviewer..."
                className={`pr-12 bg-secondary/50 border-border focus-visible:ring-primary h-11 rounded-xl transition-all ${chatInput.length >= 500 ? "!border-destructive" : ""}`}
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
              <span className="text-[10px] text-muted-foreground/60">
                Press Enter to send
              </span>
              <span className={`text-[10px] ${chatInput.length >= 450 ? (chatInput.length >= 500 ? "text-destructive font-medium" : "text-warning") : "text-muted-foreground/60"}`}>
                {chatInput.length}/500
              </span>
            </div>
          </form>
        </section>
      </div>

      {/* Anti-Paste & Suspicious Activity Overlay */}
      <AnimatePresence>
        {violationCount >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-destructive/20 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <div className="bg-background border-2 border-destructive p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4 animate-bounce">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-destructive">
                Session Terminated
              </h2>
              <p className="text-muted-foreground">
                Multiple proctoring violations were detected. Your interview has
                been automatically ended and your activity has been logged for
                review.
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => navigate("/")}
              >
                Return to Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
