import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Excalidraw } from "@excalidraw/excalidraw";
import {
  Play,
  Pause,
  ChevronLeft,
  Terminal,
  Clock,
  MessageSquare,
  AlertTriangle,
  PenTool,
  Code2,
  Maximize2,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { decryptData } from "@/lib/crypto";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function SessionReplayPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [frames, setFrames] = useState([]);
  const [currentOffset, setCurrentOffset] = useState(0); // in ms
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // multiplier
  const [activeFile, setActiveFile] = useState("main.js");
  const [activeRightTab, setActiveRightTab] = useState("whiteboard"); // "whiteboard" | "events"
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

  // Excalidraw API ref
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  // Playback refs
  const lastTickRef = useRef(null);
  const playAnimationRef = useRef(null);

  // Sync dark mode class changes
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

  // Fetch room & replay frames
  useEffect(() => {
    const loadReplayData = async () => {
      try {
        setIsLoading(true);
        // Get room details for the whiteboardKey and basic info
        const roomRes = await api.get(`/rooms/${roomId}`);
        const roomData = roomRes.data.data;
        setRoom(roomData);

        const key = roomData.whiteboardKey || "";

        // Get replay frames
        const framesRes = await api.get(`/rooms/${roomId}/replay`);
        const rawFrames = framesRes.data.data || [];

        if (rawFrames.length === 0) {
          setFrames([]);
          setIsLoading(false);
          return;
        }

        // Decrypt and process frames upfront for butter-smooth scrubbing
        const processed = await Promise.all(
          rawFrames.map(async (f) => {
            if (f.type === "whiteboard") {
              try {
                const decrypted = await decryptData(f.payload.elements, key);
                const elements = Array.isArray(decrypted)
                  ? decrypted
                  : decrypted?.elements || [];
                return { ...f, decryptedElements: elements };
              } catch (e) {
                console.error("Failed to decrypt elements in frame:", e);
                return { ...f, decryptedElements: [] };
              }
            }
            if (f.type === "code") {
              try {
                const parsedCode = JSON.parse(f.payload.code);
                return { ...f, parsedCode };
              } catch {
                // Fallback for raw text snapshots
                return { ...f, parsedCode: { "main.js": f.payload.code } };
              }
            }
            return f;
          })
        );

        setFrames(processed);
      } catch (err) {
        console.error("Failed to load replay details:", err);
        toast({
          title: "Error loading replay",
          description: "Could not fetch session timeline frames from server.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReplayData();
  }, [roomId, toast]);

  // Session timeline boundaries
  const timelineBounds = useMemo(() => {
    if (frames.length === 0) return { start: 0, end: 0, duration: 0 };
    const start = frames[0].timestamp;
    const end = frames[frames.length - 1].timestamp;
    const duration = Math.max(1000, end - start); // minimum 1s duration
    return { start, end, duration };
  }, [frames]);

  // Derive current state at currentOffset
  const currentState = useMemo(() => {
    const targetTimestamp = timelineBounds.start + currentOffset;

    let activeCodeFrame = null;
    let activeWhiteboardFrame = null;
    const passedEvents = [];

    for (const frame of frames) {
      if (frame.timestamp <= targetTimestamp) {
        passedEvents.push(frame);
        if (frame.type === "code") {
          activeCodeFrame = frame;
        } else if (frame.type === "whiteboard") {
          activeWhiteboardFrame = frame;
        }
      }
    }

    return {
      activeCodeFrame,
      activeWhiteboardFrame,
      passedEvents,
    };
  }, [frames, currentOffset, timelineBounds.start]);

  // Extract all files from active code state
  const availableFiles = useMemo(() => {
    if (currentState.activeCodeFrame?.parsedCode) {
      return Object.keys(currentState.activeCodeFrame.parsedCode);
    }
    return ["main.js"];
  }, [currentState.activeCodeFrame]);

  // Ensure activeFile is one of the available files
  useEffect(() => {
    if (availableFiles.length > 0 && !availableFiles.includes(activeFile)) {
      setActiveFile(availableFiles[0]);
    }
  }, [availableFiles, activeFile]);

  // Determine current code value to display
  const activeCodeContent = useMemo(() => {
    const codeObj = currentState.activeCodeFrame?.parsedCode;
    if (codeObj && codeObj[activeFile] !== undefined) {
      return codeObj[activeFile];
    }
    // Fallback if not loaded
    if (room?.problemStatement) {
      return room.problemStatement;
    }
    return `// Ready to replay...\n// Use the playback bar below to begin.`;
  }, [currentState.activeCodeFrame, activeFile, room?.problemStatement]);

  // Sync whiteboard scene only when active frame changes to preserve Excalidraw performance
  const lastWhiteboardFrameId = useRef(null);
  useEffect(() => {
    if (!excalidrawAPI) return;

    const frameId = currentState.activeWhiteboardFrame?._id || "empty";
    if (lastWhiteboardFrameId.current === frameId) return;

    lastWhiteboardFrameId.current = frameId;
    const elements = currentState.activeWhiteboardFrame?.decryptedElements || [];
    excalidrawAPI.updateScene({ elements });
  }, [excalidrawAPI, currentState.activeWhiteboardFrame]);

  // Playback Tick Loop
  useEffect(() => {
    if (!isPlaying) {
      if (playAnimationRef.current) {
        cancelAnimationFrame(playAnimationRef.current);
        playAnimationRef.current = null;
      }
      return;
    }

    lastTickRef.current = performance.now();

    const loop = (now) => {
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setCurrentOffset((prev) => {
        const next = prev + delta * playbackSpeed;
        if (next >= timelineBounds.duration) {
          setIsPlaying(false);
          return timelineBounds.duration;
        }
        return next;
      });

      playAnimationRef.current = requestAnimationFrame(loop);
    };

    playAnimationRef.current = requestAnimationFrame(loop);

    return () => {
      if (playAnimationRef.current) {
        cancelAnimationFrame(playAnimationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, timelineBounds.duration]);

  // Seek / jump to specific offset
  const handleSeek = (values) => {
    const value = values[0];
    setCurrentOffset(value);
  };

  const handleJumpToEvent = (eventTimestamp) => {
    const offset = Math.max(0, eventTimestamp - timelineBounds.start);
    setCurrentOffset(offset);
    toast({
      title: "Jumped to Event",
      description: `Timeline moved to ${formatOffsetTime(offset)}`,
      duration: 1500,
    });
  };

  // Time formatters
  const formatOffsetTime = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeLanguage = useMemo(() => {
    const lang = currentState.activeCodeFrame?.payload?.language;
    if (lang) return lang;
    const ext = activeFile.split(".").pop();
    if (ext === "py") return "python";
    if (ext === "java") return "java";
    if (ext === "cpp" || ext === "cc") return "cpp";
    if (ext === "go") return "go";
    if (ext === "rs") return "rust";
    if (ext === "ts") return "typescript";
    return "javascript";
  }, [currentState.activeCodeFrame, activeFile]);

  // Compile a list of timeline markers/events
  const keyEvents = useMemo(() => {
    return frames
      .map((f, index) => {
        let title = "Interaction";
        let icon = <Info className="w-3.5 h-3.5" />;
        let description = "";

        if (f.type === "code") {
          title = "Code Update";
          icon = <Code2 className="w-3.5 h-3.5 text-blue-400" />;
          description = `Auto-saved snapshot of codebase.`;
        } else if (f.type === "whiteboard") {
          title = "Whiteboard Sketch";
          icon = <PenTool className="w-3.5 h-3.5 text-emerald-400" />;
          description = `Drawing board updated.`;
        } else if (f.type === "execution") {
          title = "Code Executed";
          icon = <Terminal className="w-3.5 h-3.5 text-primary" />;
          description = `Console run triggered.`;
        } else if (f.type === "violation") {
          title = "Proctoring Violation";
          icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
          description = f.payload?.reason || `Strike generated.`;
        }

        return {
          id: f._id || index,
          type: f.type,
          title,
          icon,
          description,
          timestamp: f.timestamp,
          offset: f.timestamp - timelineBounds.start,
        };
      })
      .filter((e, idx, self) => {
        // filter out sequential duplicates of the same type to keep timeline clean
        if (idx === 0) return true;
        if (e.type === "code" || e.type === "whiteboard") {
          // only keep every 5th update of code/whiteboard or if it follows another type to avoid spamming the log
          const prev = self[idx - 1];
          return prev.type !== e.type || idx % 4 === 0;
        }
        return true;
      });
  }, [frames, timelineBounds.start]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#090b09] text-white">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full border border-primary/20 animate-pulse scale-[1.3]" />
          <div className="absolute w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-semibold tracking-wider text-primary animate-pulse">
          DECRYPTING SESSION TIMELINE...
        </p>
      </div>
    );
  }

  if (frames.length === 0) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#090b09] text-white p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold mb-2">No Replay Data Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
          There are no snapshots or interactions recorded for this interview session yet. Playback is unavailable.
        </p>
        <Button onClick={() => navigate(-1)} className="bg-primary hover:bg-primary/90">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-[#090b09] text-white overflow-hidden font-sans select-none">
      {/* Header bar */}
      <header className="h-14 border-b border-border bg-card/65 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 hover:bg-secondary active:scale-95 transition-all text-muted-foreground hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <div className="h-5 w-px bg-border/80" />
          <div>
            <h1 className="text-xs font-bold text-foreground/95 flex items-center gap-2">
              <span>{room?.title || "Replay Session"}</span>
              <span className="px-2 py-0.5 rounded text-[8px] bg-primary/10 border border-primary/20 text-primary uppercase font-bold tracking-widest">
                Replay Player
              </span>
            </h1>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <User className="w-3 h-3" />
              <span>Candidate: {room?.candidate?.name || "Placeholder"}</span>
              <span>•</span>
              <Calendar className="w-3 h-3" />
              <span>{new Date(room?.scheduledAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-secondary/20 text-[10px] font-bold text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Total Duration: {formatOffsetTime(timelineBounds.duration)}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Panels */}
      <main className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Side: Monaco Editor */}
        <section className="flex-1 flex flex-col border-r border-border min-w-0 bg-[#0c0f0c]">
          {/* File explorer tabs selector */}
          <div className="h-10 border-b border-border bg-card/45 flex items-center px-4 justify-between shrink-0 select-none overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {availableFiles.map((filename) => (
                <button
                  key={filename}
                  onClick={() => setActiveFile(filename)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all border ${
                    activeFile === filename
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "text-muted-foreground hover:text-foreground border-transparent hover:bg-secondary/40"
                  }`}
                >
                  {filename}
                </button>
              ))}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-primary" />
              <span>Read-Only Editor</span>
            </div>
          </div>

          {/* Monaco Area */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={activeLanguage}
              theme={isDark ? "vs-dark" : "light"}
              value={activeCodeContent}
              options={{
                readOnly: true,
                fontSize: 14,
                fontFamily: '"JetBrains Mono", monospace',
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
                bracketPairColorization: { enabled: true },
                smoothScrolling: true,
              }}
            />
          </div>
        </section>

        {/* Right Side: Split View (Whiteboard & Events) */}
        <aside className="w-[480px] lg:w-[540px] flex flex-col shrink-0 min-h-0 bg-[#0c0f0c]">
          {/* Tabs selector */}
          <div className="h-10 border-b border-border bg-card/45 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveRightTab("whiteboard")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all border ${
                  activeRightTab === "whiteboard"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:bg-secondary/40"
                }`}
              >
                Whiteboard
              </button>
              <button
                onClick={() => setActiveRightTab("events")}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all border ${
                  activeRightTab === "events"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:bg-secondary/40"
                }`}
              >
                Event Log ({keyEvents.length})
              </button>
            </div>
          </div>

          {/* Right tab contents */}
          <div className="flex-1 min-h-0 relative flex flex-col">
            {activeRightTab === "whiteboard" ? (
              <div className="flex-1 w-full h-full p-4 min-h-0 flex flex-col bg-card/15">
                <div className="w-full h-full relative border border-border/80 rounded-xl overflow-hidden bg-background">
                  <Excalidraw
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    theme={isDark ? "dark" : "light"}
                    viewModeEnabled={true}
                    gridModeEnabled={true}
                  />
                  {/* Floating encryption water-marker */}
                  <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-background/90 backdrop-blur-md text-[10px] font-bold text-emerald-500 shadow-md select-none border-border">
                    <span>Decrypted Replay Board</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0">
                <div className="text-[10px] text-muted-foreground/60 uppercase font-extrabold tracking-wider select-none px-1 border-b border-border/30 pb-2 mb-3">
                  Chronological Event Stream
                </div>
                {keyEvents.map((evt) => {
                  const isActive = Math.abs(currentOffset - evt.offset) < 2500;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => handleJumpToEvent(evt.timestamp)}
                      className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                        isActive
                          ? "bg-primary/15 border-primary shadow-md shadow-primary/5 text-primary-foreground scale-[1.01]"
                          : "bg-secondary/10 border-border/40 hover:bg-secondary/20 hover:border-border text-foreground/80 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 font-bold text-xs">
                          {evt.icon}
                          <span className={isActive ? "text-primary font-black" : "text-white"}>
                            {evt.title}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold tracking-wider text-muted-foreground/85 px-2 py-0.5 rounded bg-black/40">
                          {formatOffsetTime(evt.offset)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal pl-5 pr-2">
                        {evt.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Replay Control Bar at bottom */}
      <footer className="h-20 border-t border-border bg-card/90 backdrop-blur-md px-6 flex flex-col justify-center shrink-0 gap-2 select-none">
        {/* Timeline Slider */}
        <div className="w-full flex items-center gap-4">
          <span className="text-xs font-mono font-bold tracking-wider w-12 text-right">
            {formatOffsetTime(currentOffset)}
          </span>
          <div className="flex-1 py-1 relative">
            <Slider
              value={[currentOffset]}
              min={0}
              max={timelineBounds.duration}
              step={100}
              onValueChange={handleSeek}
              className="w-full relative cursor-pointer z-10"
            />
            {/* Event Markers on Slider */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 pointer-events-none select-none">
              {keyEvents.map((evt) => {
                const percentage = (evt.offset / timelineBounds.duration) * 100;
                return (
                  <div
                    key={evt.id}
                    style={{ left: `${percentage}%` }}
                    className="absolute w-1.5 h-1.5 rounded-full bg-primary/80 border border-black -translate-x-1/2"
                    title={evt.title}
                  />
                );
              })}
            </div>
          </div>
          <span className="text-xs font-mono font-bold tracking-wider w-12 text-left text-muted-foreground">
            {formatOffsetTime(timelineBounds.duration)}
          </span>
        </div>

        {/* Buttons & Speed controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Reset button */}
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-lg hover:bg-secondary border-border"
              onClick={() => {
                setCurrentOffset(0);
                setIsPlaying(false);
              }}
              title="Reset to Start"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Button>

            {/* Play/Pause */}
            <Button
              size="icon"
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow shadow-primary/20 scale-[1.05]"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </Button>
          </div>

          {/* Speed settings */}
          <div className="flex items-center gap-1.5 bg-black/45 border border-border/80 p-1 rounded-xl">
            {[1, 2, 4, 8].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                  playbackSpeed === speed
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-white hover:bg-secondary/40"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
