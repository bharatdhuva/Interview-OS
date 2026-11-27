import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  Square,
  RotateCcw,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Cpu,
  Users,
  Award,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/hooks/useToast";
import { useVoiceInterview } from "@/hooks/useVoiceInterview";
import api from "@/lib/api";

const RECOMMENDATION_LABELS = {
  strong_yes: { label: "Strong Yes", cls: "bg-[#e3f4e8] text-[#0d5216] border-[#a7dcb6]" },
  yes: { label: "Yes", cls: "bg-[#eef5ef] text-[#008a52] border-[#b7dfc3]" },
  lean_yes: { label: "Lean Yes", cls: "bg-[#f2f8e9] text-[#456b12] border-[#cde0b4]" },
  lean_no: { label: "Lean No", cls: "bg-[#fff6e5] text-[#8a5a00] border-[#f0d399]" },
  no: { label: "No", cls: "bg-[#fdecec] text-[#ba1a1a] border-[#f5bcbc]" },
  strong_no: { label: "Strong No", cls: "bg-[#fdecec] text-[#8c1111] border-[#f2a6a6]" },
};

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function AiInterviewRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [ending, setEnding] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [showTranscript, setShowTranscript] = useState(true);
  const [autoListen, setAutoListen] = useState(true);
  const [autoSendOnPause, setAutoSendOnPause] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showReportTranscript, setShowReportTranscript] = useState(false);

  const turnStartedAtRef = useRef(Date.now());
  const transcriptEndRef = useRef(null);

  const persona = session?.interviewType || "technical";
  const personaName = persona === "hr" ? "Maya" : "Alex";
  const personaTitle =
    persona === "hr" ? "Senior People Partner" : "Senior Staff Engineer";

  const handleSendAnswerRef = useRef(null);

  const voice = useVoiceInterview({
    persona,
    onAutoSend: (spokenText) => {
      handleSendAnswerRef.current?.(spokenText);
    },
  });

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ai-interview/sessions/${sessionId}`);
      setSession(res.data.data);
    } catch (err) {
      toast({
        title: "Session not found",
        description: err.response?.data?.message || "Returning to dashboard.",
        variant: "destructive",
      });
      navigate("/dashboard/candidate");
    } finally {
      setLoading(false);
    }
  }, [sessionId, navigate, toast]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Elapsed timer when active
  useEffect(() => {
    if (session?.status !== "active") return;
    const base = session.startedAt
      ? Math.max(0, Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000))
      : 0;
    setElapsedSeconds(base);
    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [session?.status, session?.startedAt]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages?.length]);

  const speakAndMaybeListen = useCallback(
    (text) => {
      turnStartedAtRef.current = Date.now();
      voice.speak(text, {
        onEnd: () => {
          if (autoListen && voice.sttSupported) {
            voice.startListening({ autoSendOnSilence: autoSendOnPause });
          }
        },
      });
    },
    [voice, autoListen, autoSendOnPause]
  );

  const handleStart = async () => {
    setStarting(true);
    setApiKeyError("");
    try {
      const res = await api.post(`/ai-interview/sessions/${sessionId}/start`);
      const updated = res.data.data;
      setSession(updated);
      const firstMsg = updated.messages?.[updated.messages.length - 1];
      if (firstMsg?.role === "interviewer") {
        speakAndMaybeListen(firstMsg.content);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to start interview.";
      if (err.response?.data?.code === "AI_NOT_CONFIGURED") {
        setApiKeyError(msg);
      } else {
        toast({ title: "Could not start", description: msg, variant: "destructive" });
      }
    } finally {
      setStarting(false);
    }
  };

  const handleSendAnswer = useCallback(
    async (overrideText) => {
      const text = (typeof overrideText === "string" ? overrideText : voice.transcript).trim();
      if (!text || thinking) return;

      voice.stopListening();
      voice.stopSpeaking();
      const durationMs = Math.max(0, Date.now() - turnStartedAtRef.current);

      // Optimistically append candidate message
      setSession((prev) =>
        prev
          ? {
              ...prev,
              messages: [
                ...prev.messages,
                {
                  role: "candidate",
                  content: text,
                  questionIndex: prev.currentQuestionIndex,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : prev
      );
      voice.resetTranscript();
      setThinking(true);
      setApiKeyError("");

      try {
        const res = await api.post(`/ai-interview/sessions/${sessionId}/turn`, {
          answer: text,
          durationMs,
        });
        const updatedSession = res.data.data.session;
        setSession(updatedSession);

        const lastMsg = updatedSession.messages?.[updatedSession.messages.length - 1];
        if (lastMsg?.role === "interviewer") {
          if (updatedSession.status === "completed") {
            voice.speak(lastMsg.content);
          } else {
            speakAndMaybeListen(lastMsg.content);
          }
        }
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to get AI response.";
        if (err.response?.data?.code === "AI_NOT_CONFIGURED") {
          setApiKeyError(msg);
        } else {
          toast({ title: "Turn error", description: msg, variant: "destructive" });
        }
      } finally {
        setThinking(false);
      }
    },
    [voice, thinking, sessionId, speakAndMaybeListen, toast]
  );

  handleSendAnswerRef.current = handleSendAnswer;

  const handleEndEarly = async () => {
    voice.stopListening();
    voice.stopSpeaking();
    setEnding(true);
    try {
      const res = await api.post(`/ai-interview/sessions/${sessionId}/end`);
      setSession(res.data.data);
      toast({
        title: "Interview completed",
        description: "Your evaluation report is ready.",
      });
    } catch (err) {
      toast({
        title: "Could not end session",
        description: err.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbf9] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#008a52] animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const latestInterviewerMsg = [...(session.messages || [])]
    .reverse()
    .find((m) => m.role === "interviewer");

  const combinedInput = voice.interimTranscript
    ? `${voice.transcript} ${voice.interimTranscript}`.trim()
    : voice.transcript;

  return (
    <div
      className="min-h-screen bg-[#fafbf9] text-[#171917] flex flex-col"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
      }}
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-30 h-[62px] bg-white/90 backdrop-blur-md border-b border-[#e2e7e1] px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/candidate"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#566059] hover:text-[#171917]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-4 w-[1px] bg-[#e2e7e1]" />
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                persona === "technical"
                  ? "bg-[#e3f4e8] text-[#0d5216]"
                  : "bg-[#e8f0fe] text-[#1a4fa3]"
              }`}
            >
              {persona === "technical" ? "Technical" : "HR Behavioral"}
            </span>
            <span className="text-[13.5px] font-semibold text-[#171917] hidden md:inline">
              {session.targetRole || `${personaName} · ${personaTitle}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {session.status === "active" && (
            <>
              <span className="px-3 py-1 rounded-full bg-[#f4f6f3] text-[12px] font-medium text-[#414740] tabular-nums">
                Q {session.currentQuestionIndex} / {session.totalQuestions}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f4f6f3] text-[12px] font-medium text-[#414740] tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#707870]" />
                {formatTimer(elapsedSeconds)}
              </span>

              <button
                type="button"
                onClick={() => voice.setMuted(!voice.muted)}
                className="p-2 rounded-full border border-[#e2e7e1] bg-white hover:bg-[#f4f6f3] text-[#414740] cursor-pointer"
                title={voice.muted ? "Unmute AI voice" : "Mute AI voice"}
              >
                {voice.muted ? (
                  <VolumeX className="w-4 h-4 text-[#ba1a1a]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#008a52]" />
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  voice.setSpeechRate(voice.speechRate === 1.0 ? 1.15 : 1.0)
                }
                className="hidden sm:inline-flex px-2.5 h-8 rounded-full border border-[#e2e7e1] bg-white hover:bg-[#f4f6f3] text-[12px] font-medium text-[#414740] cursor-pointer items-center"
                title="Toggle AI speech speed"
              >
                {voice.speechRate}x
              </button>

              <button
                type="button"
                onClick={() => setShowTranscript((v) => !v)}
                className={`p-2 rounded-full border cursor-pointer ${
                  showTranscript
                    ? "border-[#008a52] bg-[#eef5ef] text-[#008a52]"
                    : "border-[#e2e7e1] bg-white text-[#414740]"
                }`}
                title="Toggle transcript"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleEndEarly}
                disabled={ending}
                className="inline-flex items-center gap-1.5 px-4 h-8 rounded-full bg-[#ba1a1a] hover:bg-[#9b1515] disabled:opacity-50 text-white text-[12px] font-semibold cursor-pointer"
              >
                {ending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Square className="w-3 h-3 fill-current" />
                )}
                End &amp; Evaluate
              </button>
            </>
          )}
        </div>
      </header>

      {/* Setup / Pre-flight View */}
      {session.status === "setup" && (
        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-[#f6faf7] via-[#fafbf9] to-[#eef6fb]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 28%, rgba(0, 200, 117, 0.10), transparent 55%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl rounded-3xl border border-[#e2e7e1] bg-white/95 backdrop-blur-sm shadow-[0_20px_60px_-24px_rgba(16,24,20,0.12)] overflow-hidden"
          >
            {/* Top Briefing Banner */}
            <div className="px-8 pt-8 pb-6 border-b border-[#edf1ed] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-md ring-1 ring-white/60"
                  style={{
                    background:
                      "linear-gradient(145deg, #008a52 0%, #00c875 50%, #7dd3fc 100%)",
                  }}
                >
                  {persona === "technical" ? (
                    <Cpu className="w-6 h-6 text-white" />
                  ) : (
                    <Users className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e3f4e8] text-[#008a52] text-[11px] font-semibold mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00c875]" />
                    Voice Studio Ready
                  </div>
                  <h1 className="text-[23px] font-semibold text-[#171917] tracking-[-0.025em] leading-tight">
                    {persona === "technical"
                      ? `Technical Interview with ${personaName}`
                      : `HR & Behavioral Interview with ${personaName}`}
                  </h1>
                  <p className="text-[13.5px] text-[#566059] mt-0.5">
                    {personaTitle}
                    {session.targetRole ? ` · ${session.targetRole}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Session Metadata Strip */}
            <div className="grid grid-cols-3 divide-x divide-[#edf1ed] border-b border-[#edf1ed] bg-[#fafbf9]">
              <div className="px-6 py-3.5">
                <p className="text-[10.5px] uppercase tracking-[0.12em] text-[#707870]">
                  Level
                </p>
                <p className="text-[14px] font-semibold text-[#171917] capitalize mt-0.5">
                  {session.difficulty}
                </p>
              </div>
              <div className="px-6 py-3.5">
                <p className="text-[10.5px] uppercase tracking-[0.12em] text-[#707870]">
                  Questions
                </p>
                <p className="text-[14px] font-semibold text-[#171917] mt-0.5">
                  {session.totalQuestions} rounds
                </p>
              </div>
              <div className="px-6 py-3.5">
                <p className="text-[10.5px] uppercase tracking-[0.12em] text-[#707870]">
                  Est. Duration
                </p>
                <p className="text-[14px] font-semibold text-[#171917] mt-0.5">
                  ~{session.totalQuestions * 2}–{session.totalQuestions * 3} min
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              {/* Resume Context Card */}
              <div className="p-4 rounded-2xl bg-[#fafbf9] border border-[#e2e7e1] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#707870]">
                    Resume Context Loaded
                  </p>
                  <span className="text-[12px] font-medium text-[#171917] truncate max-w-[240px]">
                    {session.resume?.fileName || "Resume"}
                  </span>
                </div>
                {session.resume?.parsedSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {session.resume.parsedSkills.slice(0, 12).map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-0.5 rounded-md bg-[#eef5ef] text-[#008a52] text-[11.5px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {session.focusArea && (
                  <p className="text-[12.5px] text-[#566059] pt-1">
                    Focus area: <span className="font-medium text-[#171917]">{session.focusArea}</span>
                  </p>
                )}
              </div>

              {/* Pre-flight Capabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] text-[#414740]">
                <div className="p-3.5 rounded-xl border border-[#edf1ed] bg-white flex items-start gap-2.5">
                  <Volume2 className="w-4 h-4 text-[#008a52] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#171917]">Natural Voice Audio</p>
                    <p className="text-[12px] text-[#707870] mt-0.5">
                      {personaName} speaks each question aloud with ElevenLabs HD voice.
                    </p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-[#edf1ed] bg-white flex items-start gap-2.5">
                  <Mic className="w-4 h-4 text-[#008a52] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#171917]">Hands-Free Auto-Send</p>
                    <p className="text-[12px] text-[#707870] mt-0.5">
                      {voice.sttSupported
                        ? "Speak naturally — pauses auto-transcribe & send your reply."
                        : "Microphone unavailable — type your answers anytime."}
                    </p>
                  </div>
                </div>
              </div>

              {apiKeyError && (
                <div className="p-4 rounded-xl border border-[#f5bcbc] bg-[#fdecec] flex items-start gap-2.5 text-[13px] text-[#8c1111]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{apiKeyError}</span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <Link
                  to="/dashboard/candidate"
                  className="text-[13.5px] font-medium text-[#566059] hover:text-[#171917] text-center sm:text-left"
                >
                  ← Back to setup
                </Link>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={starting}
                  className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-full bg-[#080a09] hover:bg-[#1f2420] disabled:opacity-50 text-white text-[14px] font-semibold cursor-pointer shadow-[0_8px_24px_-6px_rgba(8,10,9,0.35)] transition-all"
                >
                  {starting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#00c875]" /> Connecting to {personaName}...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-[#00c875]" /> Start Voice Interview
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </main>
      )}

      {/* Active Voice Studio */}
      {session.status === "active" && (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 relative overflow-hidden bg-gradient-to-br from-[#f6faf7] via-[#fafbf9] to-[#eef6fb]">
          {/* Subtle ambient radial gradient behind the voice stage */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-700"
            style={{
              background: voice.isSpeaking
                ? "radial-gradient(circle at 38% 35%, rgba(0, 200, 117, 0.14), transparent 55%)"
                : voice.isListening
                ? "radial-gradient(circle at 38% 35%, rgba(2, 132, 199, 0.14), transparent 55%)"
                : "radial-gradient(circle at 38% 35%, rgba(0, 138, 82, 0.08), transparent 55%)",
            }}
          />
          <main className="relative z-10 flex-1 flex flex-col items-center justify-between p-6 max-w-4xl mx-auto w-full">
            {/* Voice Visualizer & AI Question */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl text-center space-y-6 py-4">
              {/* ChatGPT-style Fluid Gradient Voice Orb */}
              <div className="relative flex items-center justify-center w-44 h-44">
                {/* Ambient outer glow */}
                <motion.div
                  animate={{
                    scale: voice.isSpeaking
                      ? [1, 1.24, 1.06, 1.2, 1]
                      : voice.isListening
                      ? [1, 1.18, 1]
                      : [1, 1.06, 1],
                    opacity: voice.isSpeaking || voice.isListening ? [0.45, 0.75, 0.45] : [0.22, 0.35, 0.22],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: voice.isSpeaking ? 1.6 : voice.isListening ? 2.0 : 3.5,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-2 rounded-full blur-2xl"
                  style={{
                    background: voice.isListening
                      ? "radial-gradient(circle, #38bdf8 0%, #0284c7 60%, transparent 100%)"
                      : thinking
                      ? "radial-gradient(circle, #64748b 0%, #0f172a 60%, transparent 100%)"
                      : "radial-gradient(circle, #00c875 0%, #38bdf8 55%, transparent 100%)",
                  }}
                />

                {/* Main Gradient Sphere */}
                <motion.div
                  animate={{
                    scale: voice.isSpeaking
                      ? [1, 1.08, 0.98, 1.06, 1]
                      : voice.isListening
                      ? [1, 1.05, 1]
                      : [1, 1.02, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: voice.isSpeaking ? 1.4 : 2.6,
                    ease: "easeInOut",
                  }}
                  className="relative z-10 w-32 h-32 rounded-full overflow-hidden shadow-[0_18px_45px_-12px_rgba(0,138,82,0.45)] ring-1 ring-white/50"
                  style={{
                    background: voice.isListening
                      ? "linear-gradient(145deg, #0284c7 0%, #38bdf8 48%, #e0f2fe 100%)"
                      : thinking
                      ? "linear-gradient(145deg, #0f172a 0%, #334155 55%, #94a3b8 100%)"
                      : "linear-gradient(145deg, #008a52 0%, #00c875 45%, #7dd3fc 100%)",
                  }}
                >
                  {/* Drifting fluid cloud layer 1 */}
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: voice.isSpeaking ? [1, 1.18, 1] : [1, 1.08, 1],
                    }}
                    transition={{
                      rotate: { repeat: Infinity, duration: 9, ease: "linear" },
                      scale: { repeat: Infinity, duration: 2.4, ease: "easeInOut" },
                    }}
                    className="absolute -inset-6 opacity-80 blur-md"
                    style={{
                      background: voice.isListening
                        ? "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), transparent 55%), radial-gradient(circle at 75% 70%, rgba(14,165,233,0.9), transparent 55%)"
                        : thinking
                        ? "radial-gradient(circle at 35% 30%, rgba(226,232,240,0.6), transparent 55%), radial-gradient(circle at 70% 75%, rgba(56,189,248,0.45), transparent 55%)"
                        : "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), transparent 52%), radial-gradient(circle at 72% 72%, rgba(56,189,248,0.85), transparent 55%)",
                    }}
                  />
                  {/* Drifting fluid cloud layer 2 */}
                  <motion.div
                    animate={{
                      rotate: [360, 0],
                      y: [4, -6, 4],
                    }}
                    transition={{
                      rotate: { repeat: Infinity, duration: 13, ease: "linear" },
                      y: { repeat: Infinity, duration: 3.2, ease: "easeInOut" },
                    }}
                    className="absolute -inset-4 opacity-70 blur-sm"
                    style={{
                      background:
                        "radial-gradient(circle at 65% 25%, rgba(255,255,255,0.75), transparent 48%)",
                    }}
                  />
                  {/* Soft bottom cloud sheen */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 95%, rgba(255,255,255,0.65), transparent 55%)",
                    }}
                  />
                </motion.div>
              </div>

              <div className="space-y-1">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#008a52]">
                  {thinking
                    ? `${personaName} is thinking...`
                    : voice.isSpeaking
                    ? `${personaName} is speaking`
                    : voice.isListening
                    ? "Listening to your answer..."
                    : `Your turn · ${personaName} is ready`}
                </p>
                {latestInterviewerMsg?.topic && (
                  <p className="text-[12px] text-[#707870]">
                    Topic: {latestInterviewerMsg.topic}
                  </p>
                )}
              </div>

              {/* Current AI Spoken Question */}
              {latestInterviewerMsg && (
                <div className="w-full p-6 rounded-2xl border border-[#e2e7e1] bg-white shadow-sm text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#171917]">
                      {personaName} ({personaTitle})
                    </span>
                    <button
                      type="button"
                      onClick={() => voice.speak(latestInterviewerMsg.content)}
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-[#008a52] hover:underline bg-transparent border-none cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Replay
                    </button>
                  </div>
                  <p className="text-[15.5px] leading-relaxed text-[#171917]">
                    {latestInterviewerMsg.content}
                  </p>
                </div>
              )}

              {apiKeyError && (
                <div className="w-full p-3.5 rounded-xl border border-[#f5bcbc] bg-[#fdecec] text-[13px] text-[#8c1111] text-left">
                  {apiKeyError}
                </div>
              )}
            </div>

            {/* Candidate Answer & Voice Controls */}
            <div className="w-full max-w-2xl rounded-2xl border border-[#e2e7e1] bg-white p-4 space-y-3 shadow-sm">
              {voice.micError && (
                <p className="text-[12px] text-[#ba1a1a]">{voice.micError}</p>
              )}

              <Textarea
                value={combinedInput}
                onChange={(e) => voice.updateTranscript(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAnswer();
                  }
                }}
                placeholder={
                  voice.isListening
                    ? "Speak naturally — your words appear here in real time..."
                    : "Click the mic to speak, or type your answer here (Enter to send)..."
                }
                className="min-h-[84px] bg-[#fafbf9] border-[#e2e7e1] text-[14px] resize-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (voice.isListening) {
                        voice.stopListening();
                      } else {
                        voice.startListening({ autoSendOnSilence: autoSendOnPause });
                      }
                    }}
                    disabled={!voice.sttSupported || thinking}
                    className={`inline-flex items-center gap-2 px-4 h-10 rounded-full text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-40 ${
                      voice.isListening
                        ? "bg-[#0284c7] text-white hover:bg-[#0369a1]"
                        : "bg-[#eef5ef] text-[#008a52] hover:bg-[#dcf0e2]"
                    }`}
                  >
                    {voice.isListening ? (
                      <>
                        <MicOff className="w-4 h-4" /> Stop Mic
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" /> Speak Answer
                      </>
                    )}
                  </button>

                  <label className="hidden sm:inline-flex items-center gap-1.5 text-[12px] text-[#566059] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoListen}
                      onChange={(e) => setAutoListen(e.target.checked)}
                      className="accent-[#008a52]"
                    />
                    Auto-listen
                  </label>

                  <label className="hidden sm:inline-flex items-center gap-1.5 text-[12px] text-[#566059] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoSendOnPause}
                      onChange={(e) => setAutoSendOnPause(e.target.checked)}
                      className="accent-[#008a52]"
                    />
                    Auto-send on pause
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendAnswer()}
                  disabled={!combinedInput.trim() || thinking}
                  className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full bg-[#080a09] hover:bg-[#242925] disabled:opacity-40 text-white text-[13px] font-semibold cursor-pointer"
                >
                  {thinking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Send <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </main>

          {/* Secondary Side Panel: Conversation History */}
          {showTranscript && (
            <aside className="flex w-full md:w-[320px] xl:w-[360px] shrink-0 border-t md:border-t-0 md:border-l border-[#e2e7e1] bg-white flex-col md:h-[calc(100vh-62px)] md:sticky md:top-[62px]">
              <div className="px-4 py-3.5 border-b border-[#e2e7e1] flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#171917]">
                  Conversation History
                </span>
                <span className="text-[11.5px] text-[#707870]">
                  {session.messages?.length || 0} turns
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(session.messages || []).map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-[13px] leading-relaxed ${
                      m.role === "interviewer"
                        ? "bg-[#f4f6f3] text-[#171917]"
                        : "bg-[#eef5ef] text-[#0d5216] ml-4"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-1 opacity-75">
                      <span>{m.role === "interviewer" ? personaName : "You"}</span>
                      {m.topic && <span>{m.topic}</span>}
                    </div>
                    <p>{m.content}</p>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            </aside>
          )}
        </div>
      )}

      {/* Completed Evaluation Report */}
      {session.status === "completed" && (
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e2e7e1]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#707870]">
                AI Interview Evaluation Report
              </p>
              <h1 className="text-[28px] font-semibold text-[#171917] tracking-[-0.03em] mt-1">
                {session.targetRole || `${persona === "technical" ? "Technical" : "HR Behavioral"} Mock Interview`}
              </h1>
              <p className="text-[13.5px] text-[#566059] mt-1">
                Conducted by {personaName} ({personaTitle}) · Duration {formatTimer(session.durationSeconds || 0)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard/candidate")}
              className="px-5 h-10 rounded-full bg-[#080a09] hover:bg-[#242925] text-white text-[13px] font-semibold cursor-pointer shrink-0"
            >
              Back to Dashboard
            </button>
          </div>

          {session.evaluation && (
            <>
              {/* Score & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 p-6 rounded-2xl border border-[#e2e7e1] bg-white flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-24 h-24 rounded-full border-4 border-[#00c875] bg-[#eef5ef] flex flex-col items-center justify-center">
                    <span className="text-[28px] font-bold text-[#171917] leading-none tabular-nums">
                      {session.evaluation.overallScore}
                    </span>
                    <span className="text-[11px] text-[#566059]">/ 100</span>
                  </div>
                  {(() => {
                    const rec =
                      RECOMMENDATION_LABELS[session.evaluation.recommendation] ||
                      RECOMMENDATION_LABELS.lean_yes;
                    return (
                      <span
                        className={`px-3 py-1 rounded-full text-[12px] font-semibold border ${rec.cls}`}
                      >
                        {rec.label}
                      </span>
                    );
                  })()}
                </div>

                <div className="md:col-span-8 p-6 rounded-2xl border border-[#e2e7e1] bg-white space-y-3">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-[#171917]">
                    <Award className="w-4 h-4 text-[#008a52]" />
                    Executive Summary
                  </div>
                  <p className="text-[14px] text-[#414740] leading-relaxed">
                    {session.evaluation.summary}
                  </p>
                </div>
              </div>

              {/* 4 Dimensions */}
              {session.evaluation.dimensions && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "communication", label: "Communication" },
                    { key: "roleKnowledge", label: "Role & Technical Knowledge" },
                    { key: "problemSolving", label: "Problem Solving / STAR" },
                    { key: "confidenceAndClarity", label: "Confidence & Clarity" },
                  ].map((dim) => {
                    const item = session.evaluation.dimensions[dim.key];
                    if (!item) return null;
                    return (
                      <div
                        key={dim.key}
                        className="p-5 rounded-xl border border-[#e2e7e1] bg-white space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-semibold text-[#171917]">
                            {dim.label}
                          </span>
                          <span className="text-[13px] font-bold text-[#008a52] tabular-nums">
                            {item.score} / 5
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#eef1ee] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#00c875]"
                            style={{ width: `${(item.score / 5) * 100}%` }}
                          />
                        </div>
                        <p className="text-[13px] text-[#566059] leading-relaxed">
                          {item.notes}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-[#e2e7e1] bg-white space-y-3">
                  <h3 className="text-[15px] font-semibold text-[#171917] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#008a52]" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2 text-[13.5px] text-[#414740]">
                    {(session.evaluation.strengths || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#008a52] mt-1">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl border border-[#e2e7e1] bg-white space-y-3">
                  <h3 className="text-[15px] font-semibold text-[#171917] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#0284c7]" />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-2 text-[13.5px] text-[#414740]">
                    {(session.evaluation.improvements || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#0284c7] mt-1">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Per-Question Breakdown */}
              {session.evaluation.questionFeedback?.length > 0 && (
                <div className="p-6 rounded-2xl border border-[#e2e7e1] bg-white space-y-4">
                  <h3 className="text-[15px] font-semibold text-[#171917]">
                    Question-by-Question Breakdown
                  </h3>
                  <div className="space-y-3">
                    {session.evaluation.questionFeedback.map((qf, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-[#fafbf9] border border-[#e2e7e1] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13.5px] font-semibold text-[#171917]">
                            {qf.topic}
                          </span>
                          <span className="text-[12px] font-semibold text-[#008a52]">
                            {qf.score} / 5
                          </span>
                        </div>
                        <p className="text-[13px] text-[#566059]">
                          {qf.answerSummary}
                        </p>
                        <p className="text-[12.5px] text-[#0d5216] bg-[#eef5ef] px-3 py-1.5 rounded-lg">
                          Tip: {qf.tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Collapsible Transcript */}
          <div className="rounded-2xl border border-[#e2e7e1] bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setShowReportTranscript((v) => !v)}
              className="w-full px-6 py-4 flex items-center justify-between text-[14px] font-semibold text-[#171917] bg-transparent border-none cursor-pointer"
            >
              <span>Full Interview Transcript ({session.messages?.length || 0} messages)</span>
              {showReportTranscript ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {showReportTranscript && (
              <div className="px-6 pb-6 space-y-3 border-t border-[#e2e7e1] pt-4">
                {(session.messages || []).map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl text-[13.5px] ${
                      m.role === "interviewer"
                        ? "bg-[#f4f6f3] text-[#171917]"
                        : "bg-[#eef5ef] text-[#0d5216]"
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 opacity-70">
                      {m.role === "interviewer" ? personaName : "Candidate"}
                    </p>
                    <p className="leading-relaxed">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
