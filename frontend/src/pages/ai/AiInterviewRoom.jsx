import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AudioLines,
  Captions,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Award,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Waves,
  X,
  Briefcase,
  FileText,
  Layers,
  Lightbulb,
  MessageSquare,
  Printer,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import { useVoiceInterview } from "@/hooks/useVoiceInterview";
import api from "@/lib/api";
import "./AiInterviewRoom.css";

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
  const authUser = useAuthStore((s) => s.user);
  const candidateName = authUser?.name || "Your profile";
  const candidateInitial = candidateName.trim().charAt(0).toUpperCase() || "Y";

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [ending, setEnding] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [autoListen] = useState(true);
  const [autoSendOnPause] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showReportTranscript, setShowReportTranscript] = useState(false);
  const [typedChars, setTypedChars] = useState(0);

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

  const latestInterviewerMsg = [...(session?.messages || [])]
    .reverse()
    .find((m) => m.role === "interviewer");

  const activeCaptionText =
    latestInterviewerMsg?.content ||
    `Hi, I'm ${personaName}. Speak naturally whenever you're ready.`;

  useEffect(() => {
    setTypedChars(0);
  }, [activeCaptionText]);

  useEffect(() => {
    if (!voice.isSpeaking || voice.speechMode === "idle") {
      setTypedChars(activeCaptionText.length);
      return;
    }
    if (voice.speechMode === "loading") {
      setTypedChars(0);
      return;
    }
    if (voice.speechMode === "audio") {
      const target = Math.ceil(
        activeCaptionText.length * Math.min(1, voice.speechProgress * 1.03)
      );
      setTypedChars(target);
      return;
    }
    // Browser SpeechSynthesis fallback
    const id = window.setInterval(() => {
      setTypedChars((prev) => {
        if (prev >= activeCaptionText.length) {
          window.clearInterval(id);
          return prev;
        }
        return Math.min(activeCaptionText.length, prev + 1);
      });
    }, 52);
    return () => window.clearInterval(id);
  }, [activeCaptionText, voice.isSpeaking, voice.speechMode, voice.speechProgress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbf9] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#008a52] animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const combinedInput = voice.interimTranscript
    ? `${voice.transcript} ${voice.interimTranscript}`.trim()
    : voice.transcript;

  if (session.status === "active") {
    const questionNum = Math.max(1, session.currentQuestionIndex || 1);
    const totalQuestions = Math.max(1, session.totalQuestions || 5);
    const progressPct = Math.min(100, (questionNum / totalQuestions) * 100);
    const statusEyebrow = thinking
      ? `${personaName} is thinking`
      : voice.isTranscribing
      ? "Processing your response"
      : voice.isListening
      ? "Listening to you"
      : voice.isSpeaking
      ? "AI interviewer speaking"
      : "Your turn to speak";

    const handleMainVoiceButton = () => {
      if (thinking || ending) return;
      if (voice.isListening) {
        voice.stopListening();
        return;
      }
      if (voice.isSpeaking) {
        voice.stopSpeaking();
      }
      voice.startListening({ autoSendOnSilence: autoSendOnPause });
    };

    return (
      <main className={`interview-app ${showTranscript ? "captions-open" : ""}`}>
        <header className="topbar">
          <Link className="brand" to="/dashboard/candidate" aria-label="InterviewOS Dashboard">
            <span>InterviewOS</span>
            <span className="brand-bar" aria-hidden="true" />
          </Link>

          <div className="session-title">
            <span className="session-label">
              {persona === "technical" ? "TECHNICAL VOICE" : "HR VOICE"}
            </span>
            <span className="session-role">
              {session.targetRole || `${personaName} · ${personaTitle}`}
            </span>
          </div>

          <div className="desktop-session-info">
            <strong>
              {personaName} <span>·</span> {personaTitle}
            </strong>
            <div>
              <span className="intro-badge">
                Q {String(questionNum).padStart(2, "0")} / {String(totalQuestions).padStart(2, "0")}
              </span>
              <span className="desktop-live">
                <i />
                Live
              </span>
            </div>
          </div>

          <button
            type="button"
            className="icon-button top-settings"
            onClick={() => voice.setMuted(!voice.muted)}
            aria-label={voice.muted ? "Unmute audio" : "Mute audio"}
          >
            {voice.muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <div className="desktop-top-actions">
            <span className="desktop-timer" aria-label={`Session time ${formatTimer(elapsedSeconds)}`}>
              {formatTimer(elapsedSeconds)}
            </span>
            <button
              type="button"
              className={`captions-button ${showTranscript ? "captions-active" : ""}`}
              onClick={() => setShowTranscript((value) => !value)}
              aria-expanded={showTranscript}
            >
              <Captions size={18} />
              {showTranscript ? "Close captions" : "Captions"}
            </button>
          </div>

          <button
            type="button"
            className="exit-button"
            onClick={handleEndEarly}
            disabled={ending}
          >
            {ending ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}
            <span>{ending ? "Evaluating..." : "End session"}</span>
          </button>
        </header>

        <div className="room-layout">
          <section className="stage" aria-label="Voice interview in progress">
            <div className="stage-topline">
              <Link className="back-link" to="/dashboard/candidate">
                <ArrowLeft size={16} /> Dashboard
              </Link>
              <div className="stage-meta">
                <span className="live-dot" /> Live voice session{" "}
                {latestInterviewerMsg?.topic && (
                  <>
                    <span className="meta-separator">/</span> {latestInterviewerMsg.topic}
                  </>
                )}
              </div>
            </div>

            <div className="interview-content">
              <div
                className={`voice-scene ${voice.isSpeaking ? "is-speaking" : ""} ${
                  voice.isListening ? "is-listening" : ""
                }`}
                data-audio-reactive={voice.isSpeaking && voice.speechLevel > 0.01 ? "true" : "false"}
                style={{
                  "--orb-scale":
                    voice.isSpeaking && voice.speechLevel > 0.01
                      ? (1 + voice.speechLevel * 0.18).toFixed(3)
                      : "1",
                }}
                aria-label={
                  voice.isListening
                    ? "Microphone listening"
                    : voice.isSpeaking
                    ? "Interviewer speaking"
                    : "Voice interview visualizer"
                }
              >
                <div className="scene-glow" />
                <div className="voice-rings">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="voice-orb">
                  <span className="orb-shine" />
                  <span className="orb-core" />
                </div>
                <div className="voice-bars" aria-hidden="true">
                  {Array.from({ length: 37 }, (_, index) => (
                    <span key={index} style={{ "--bar-index": index }} />
                  ))}
                </div>
              </div>

              <div className="speaker-status">
                <span className="status-eyebrow">
                  <span className="status-pulse" />
                  {statusEyebrow}
                </span>
                <span className="speaker-name">
                  {personaName} <span>·</span> {personaTitle}
                </span>
              </div>

              <div className="question-card">
                <div className="question-top">
                  <span className="question-kicker">
                    QUESTION {String(questionNum).padStart(2, "0")}{" "}
                    <span>/ {String(totalQuestions).padStart(2, "0")}</span>
                  </span>
                  <span className="voice-only-tag">
                    <Waves size={13} /> SPEECH TO SPEECH
                  </span>
                </div>
                <h1>
                  {voice.isSpeaking
                    ? activeCaptionText.slice(0, typedChars)
                    : activeCaptionText}
                  {voice.isSpeaking && typedChars < activeCaptionText.length && (
                    <span className="caption-caret" aria-hidden="true" />
                  )}
                </h1>
                <div className="question-bottom">
                  <span>
                    <Clock3 size={14} /> Answer out loud; I&apos;ll listen for your response.
                  </span>
                  <span className="question-progress">
                    {questionNum} of {totalQuestions}
                  </span>
                </div>
              </div>

              <div className="voice-control-card">
                <button
                  type="button"
                  className="desktop-mute-button"
                  onClick={() => voice.setMuted(!voice.muted)}
                  aria-label={voice.muted ? "Unmute interviewer audio" : "Mute interviewer audio"}
                >
                  {voice.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <span>{voice.muted ? "Unmute" : "Mute"}</span>
                </button>

                <button
                  type="button"
                  className={`voice-control ${voice.isListening ? "mic-active" : ""}`}
                  onClick={handleMainVoiceButton}
                  disabled={thinking || ending || !voice.sttSupported}
                  aria-pressed={voice.isListening}
                >
                  {thinking ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : voice.isListening ? (
                    <MicOff size={20} />
                  ) : (
                    <Mic size={20} />
                  )}
                  <span>
                    {thinking
                      ? `${personaName} is thinking…`
                      : voice.isListening
                      ? "Listening · tap to finish"
                      : voice.isSpeaking
                      ? "Speaking · tap to reply"
                      : "Tap to answer"}
                  </span>
                </button>

                <button
                  type="button"
                  className="mobile-captions-btn"
                  onClick={() => setShowTranscript((v) => !v)}
                  aria-label="Open captions and chat"
                  aria-expanded={showTranscript}
                >
                  <Captions size={18} />
                </button>

                <span className="voice-control-hint">
                  {voice.isListening
                    ? "Your answer is sent automatically after a brief pause."
                    : "No typing required. Just speak naturally."}
                </span>

                {(voice.micError || apiKeyError) && (
                  <p className="notice" role="status">
                    {voice.micError || apiKeyError}
                  </p>
                )}
              </div>

              <div className="stage-footer">
                <span>
                  <span className="secure-dot" /> Your answers stay private
                </span>
                <span>Powered by InterviewOS AI</span>
              </div>
            </div>
          </section>

          {showTranscript && (
            <div
              className="transcript-backdrop"
              onClick={() => setShowTranscript(false)}
              aria-hidden="true"
            />
          )}

          <aside
            className={`transcript-panel ${showTranscript ? "is-open" : ""}`}
            aria-label="Conversation transcript and participants"
          >
            <div className="sheet-handle" aria-hidden="true" />
            <div className="transcript-header">
              <div>
                <span className="transcript-kicker">PEOPLE IN THIS SESSION</span>
                <h2>Interview room</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowTranscript(false)}
                aria-label="Close captions"
              >
                <X size={17} />
              </button>
            </div>

            <div className="participant-list">
              <div className="participant-card">
                <div className="profile-avatar ai-profile">
                  <AudioLines size={16} />
                </div>
                <div className="participant-meta">
                  <strong>{personaName}</strong>
                  <span>{personaTitle}</span>
                </div>
                <span className="participant-status">
                  <i /> AI
                </span>
              </div>

              <div className="participant-card">
                <div className="profile-avatar user-profile">{candidateInitial}</div>
                <div className="participant-meta">
                  <strong>{candidateName}</strong>
                  <span>Candidate</span>
                </div>
                <span className="participant-status candidate-status">
                  <i /> YOU
                </span>
              </div>
            </div>

            <div className="session-progress">
              <div className="progress-copy">
                <span>SESSION TIMELINE</span>
                <span>
                  {String(questionNum).padStart(2, "0")} <i>/</i>{" "}
                  {String(totalQuestions).padStart(2, "0")}
                </span>
              </div>
              <div className="progress-track">
                <span style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="transcript-list" aria-live="polite">
              {(session.messages || []).map((m, idx) => (
                <article
                  className={`transcript-turn ${m.role === "interviewer" ? "interviewer" : "you"}`}
                  key={idx}
                >
                  <div className={`turn-avatar ${m.role === "candidate" ? "user-turn-avatar" : ""}`}>
                    {m.role === "interviewer" ? <AudioLines size={14} /> : candidateInitial}
                  </div>
                  <div className="turn-content">
                    <div className="turn-heading">
                      <strong>
                        {m.role === "interviewer" ? `${personaName} · AI` : "You · Candidate"}
                      </strong>
                      {m.topic && <time>{m.topic}</time>}
                    </div>
                    <p>{m.content}</p>
                  </div>
                </article>
              ))}
              <div ref={transcriptEndRef} />
            </div>

            <form
              className="transcript-composer"
              onSubmit={(e) => {
                e.preventDefault();
                if (combinedInput.trim()) handleSendAnswer();
              }}
            >
              <input
                type="text"
                value={combinedInput}
                onChange={(e) => voice.updateTranscript(e.target.value)}
                placeholder="Type an answer instead..."
                disabled={thinking || ending}
              />
              <button type="submit" disabled={!combinedInput.trim() || thinking || ending}>
                Send
              </button>
            </form>

            <div className="transcript-footer">
              <div className="timer-icon">
                <Clock3 size={15} />
              </div>
              <div className="timer-copy">
                <span>SESSION TIME</span>
                <strong>{formatTimer(elapsedSeconds)}</strong>
              </div>
              <div className="audio-control">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => voice.setMuted(!voice.muted)}
                  aria-label={voice.muted ? "Unmute audio" : "Mute audio"}
                >
                  {voice.muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>
                <span>{voice.muted ? "Muted" : "Audio on"}</span>
              </div>
            </div>
          </aside>
        </div>

        <div className="desktop-self-view" aria-label="Candidate profile, voice only">
          <span className="self-view-status">
            <i /> VOICE ONLY
          </span>
          <div className="self-view-avatar">{candidateInitial}</div>
          <strong>{candidateName}</strong>
          <span>Candidate</span>
        </div>
      </main>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#fafbf9] text-[#171917] flex flex-col"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
      }}
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-30 h-[58px] sm:h-[62px] bg-white/92 backdrop-blur-md border-b border-[#e2e7e1] px-4 sm:px-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            to="/dashboard/candidate"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#566059] hover:text-[#171917] shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-4 w-[1px] bg-[#e2e7e1] shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold uppercase shrink-0 ${
                persona === "technical"
                  ? "bg-[#e3f4e8] text-[#0d5216]"
                  : "bg-[#e8f0fe] text-[#1a4fa3]"
              }`}
            >
              {persona === "technical" ? "Technical" : "HR Behavioral"}
            </span>
            <span className="text-[13.5px] font-semibold text-[#171917] hidden md:inline truncate">
              {session.targetRole || `${personaName} · ${personaTitle}`}
            </span>
          </div>
        </div>

        <Link
          to="/dashboard/candidate"
          className="inline-flex items-center gap-[4px] text-[#111111] text-[15px] font-bold tracking-[-0.01em] leading-none shrink-0"
          aria-label="InterviewOS"
        >
          InterviewOS
          <span className="inline-block w-[5px] h-[12px] bg-[#00c875]" aria-hidden="true" />
        </Link>
      </header>

      {/* Setup / Pre-flight View */}
      {session.status === "setup" && (
        <main className="flex-1 flex items-start md:items-center justify-center px-4 py-6 sm:px-6 sm:py-12 bg-[#fafbf9]">
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-10 items-center">
            {/* Left: Session Briefing */}
            <div className="md:col-span-7 space-y-5">
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#008a52]">
                  {persona === "technical" ? "Technical Interview" : "Behavioral Interview"}
                </p>
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#171917] tracking-[-0.025em] leading-[1.15]">
                  {session.targetRole
                    ? `${session.targetRole.length <= 4 ? session.targetRole.toUpperCase() : session.targetRole} with ${personaName}`
                    : `Interview with ${personaName}`}
                </h1>
                <p className="text-[13.5px] text-[#5d635d]">
                  {personaName} · {personaTitle}
                </p>
              </div>

              <div className="grid grid-cols-3 divide-x divide-[#e2e7e1] rounded-xl border border-[#e2e7e1] bg-white">
                <div className="px-3.5 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#707870]">Level</p>
                  <p className="text-[13.5px] font-semibold text-[#171917] capitalize mt-0.5">
                    {session.difficulty}
                  </p>
                </div>
                <div className="px-3.5 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#707870]">Rounds</p>
                  <p className="text-[13.5px] font-semibold text-[#171917] mt-0.5">
                    {session.totalQuestions} questions
                  </p>
                </div>
                <div className="px-3.5 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#707870]">Est. Time</p>
                  <p className="text-[13.5px] font-semibold text-[#171917] mt-0.5">
                    ~{session.totalQuestions * 2}–{session.totalQuestions * 3}m
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#e2e7e1] bg-white px-4 py-3 space-y-1.5 text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#5d635d] shrink-0">Resume</span>
                  <span className="font-medium text-[#171917] truncate">
                    {session.resume?.fileName || "Attached"}
                  </span>
                </div>
                {session.focusArea && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#5d635d] shrink-0">Focus</span>
                    <span className="font-medium text-[#171917] truncate">
                      {session.focusArea}
                    </span>
                  </div>
                )}
                {session.resume?.parsedSkills?.length > 0 && (
                  <p className="text-[12px] text-[#5d635d] pt-1 border-t border-[#edf1ed] leading-relaxed">
                    <span className="text-[#171917] font-medium">Topics: </span>
                    {session.resume.parsedSkills.slice(0, 6).join(", ")}
                    {session.resume.parsedSkills.length > 6
                      ? ` +${session.resume.parsedSkills.length - 6} more`
                      : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Pre-flight Join Card */}
            <div className="md:col-span-5 rounded-2xl border border-[#e2e7e1] bg-white p-5 sm:p-6 space-y-4 sm:space-y-5">
              <div className="flex items-center gap-3 pb-3.5 border-b border-[#edf1ed]">
                <div className="w-10 h-10 rounded-full bg-[#e3f4e8] text-[#0d5216] font-semibold text-[14px] flex items-center justify-center shrink-0">
                  {candidateInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#171917] truncate">
                    {candidateName}
                  </p>
                  <p className="text-[12px] text-[#5d635d]">Candidate · Voice session</p>
                </div>
              </div>

              <div className="space-y-2 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#5d635d] flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#5d635d]" /> Microphone
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#171917]">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        voice.sttSupported ? "bg-[#00c875]" : "bg-amber-500"
                      }`}
                    />
                    {voice.sttSupported ? "Ready" : "Text fallback"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5d635d] flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#5d635d]" /> Audio output
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#171917]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00c875]" />
                    Enabled
                  </span>
                </div>
              </div>

              {apiKeyError && (
                <div className="p-3 rounded-lg border border-[#f5bcbc] bg-[#fdecec] flex items-start gap-2 text-[12.5px] text-[#8c1111]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{apiKeyError}</span>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={starting}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-[#080a09] hover:bg-[#1f2420] active:scale-[0.99] disabled:opacity-50 text-white text-[14px] font-semibold cursor-pointer transition-all"
                >
                  {starting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
                    </>
                  ) : (
                    "Start Interview"
                  )}
                </button>
                <Link
                  to="/dashboard/candidate"
                  className="hidden md:block text-center text-[12.5px] text-[#5d635d] hover:text-[#171917] py-1"
                >
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Completed Evaluation Report */}
      {session.status === "completed" && (() => {
        const evaluation = session.evaluation;
        const score = Math.max(0, Math.min(100, Number(evaluation?.overallScore ?? 0)));
        const scoreColor =
          score >= 70 ? "#008a52" : score >= 45 ? "#d97706" : "#ba1a1a";
        const scoreBg =
          score >= 70 ? "#eef5ef" : score >= 45 ? "#fff8eb" : "#fdecec";
        const ringRadius = 46;
        const ringCircumference = 2 * Math.PI * ringRadius;
        const ringOffset = ringCircumference * (1 - score / 100);

        const dims = evaluation?.dimensions || {};
        const dimConfigs = [
          { key: "communication", short: "Comm", label: "Communication", icon: MessageSquare },
          { key: "roleKnowledge", short: "Role", label: "Role & Technical Knowledge", icon: Briefcase },
          { key: "problemSolving", short: "Problem", label: "Problem Solving / STAR", icon: Lightbulb },
          { key: "confidenceAndClarity", short: "Clarity", label: "Confidence & Clarity", icon: ShieldCheck },
        ];

        // 4-axis SVG radar polygon points around center (90, 90), max radius 56
        const radarCenter = 90;
        const radarMax = 56;
        const radarAxes = [
          { dx: 0, dy: -1, val: (dims.communication?.score ?? 0) / 5 },
          { dx: 1, dy: 0, val: (dims.roleKnowledge?.score ?? 0) / 5 },
          { dx: 0, dy: 1, val: (dims.problemSolving?.score ?? 0) / 5 },
          { dx: -1, dy: 0, val: (dims.confidenceAndClarity?.score ?? 0) / 5 },
        ];
        const radarPoints = radarAxes
          .map((a) => {
            const r = Math.max(0.08, a.val) * radarMax;
            return `${(radarCenter + a.dx * r).toFixed(1)},${(radarCenter + a.dy * r).toFixed(1)}`;
          })
          .join(" ");

        return (
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 sm:py-10 space-y-6 sm:space-y-8">
            {/* Report Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-[#e2e7e1]">
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5d635d]">
                  Evaluation Report
                </p>
                <h1 className="text-[28px] sm:text-[32px] font-semibold text-[#171917] tracking-[-0.025em] leading-tight">
                  {session.targetRole ||
                    `${persona === "technical" ? "Technical" : "HR Behavioral"} Interview`}
                </h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#5d635d]">
                  <span className="inline-flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#008a52]" />
                    {personaName} · {personaTitle}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="w-3.5 h-3.5 text-[#5d635d]" />
                    {formatTimer(session.durationSeconds || 0)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#5d635d]" />
                    {session.currentQuestionIndex || session.totalQuestions} rounds
                  </span>
                  {session.resume?.fileName && (
                    <span className="inline-flex items-center gap-1.5 truncate max-w-[200px]">
                      <FileText className="w-3.5 h-3.5 text-[#5d635d] shrink-0" />
                      {session.resume.fileName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 h-10 rounded-full border border-[#e2e7e1] bg-white hover:bg-[#f4f6f3] text-[#171917] text-[13px] font-medium cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/candidate")}
                  className="px-5 h-10 rounded-full bg-[#080a09] hover:bg-[#242925] text-white text-[13px] font-semibold cursor-pointer transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>

            {evaluation && (
              <>
                {/* Hero Scorecard Row: Radial Gauge + 4-Axis Radar + Executive Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Overall Score SVG Radial Gauge */}
                  <div className="lg:col-span-3 p-6 rounded-2xl border border-[#e2e7e1] bg-white flex flex-col items-center justify-center text-center space-y-3">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
                        <circle
                          cx="56"
                          cy="56"
                          r={ringRadius}
                          fill={scoreBg}
                          stroke="#edf1ed"
                          strokeWidth="8"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r={ringRadius}
                          fill="none"
                          stroke={scoreColor}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={ringCircumference}
                          strokeDashoffset={ringOffset}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[28px] font-bold text-[#171917] leading-none tabular-nums">
                          {score}
                        </span>
                        <span className="text-[11px] font-medium text-[#5d635d] mt-0.5">
                          / 100
                        </span>
                      </div>
                    </div>

                    {(() => {
                      const rec =
                        RECOMMENDATION_LABELS[evaluation.recommendation] ||
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

                  {/* 4-Axis Competency Radar SVG */}
                  <div className="lg:col-span-4 p-5 rounded-2xl border border-[#e2e7e1] bg-white flex flex-col items-center justify-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d635d] mb-1">
                      Competency Shape
                    </p>
                    <svg viewBox="0 0 180 180" className="w-44 h-44" aria-label="Competency radar chart">
                      {[0.33, 0.66, 1].map((step) => {
                        const r = radarMax * step;
                        const pts = `${radarCenter},${radarCenter - r} ${radarCenter + r},${radarCenter} ${radarCenter},${radarCenter + r} ${radarCenter - r},${radarCenter}`;
                        return (
                          <polygon
                            key={step}
                            points={pts}
                            fill="none"
                            stroke="#e2e7e1"
                            strokeWidth="1"
                          />
                        );
                      })}
                      <line x1={radarCenter} y1={radarCenter - radarMax} x2={radarCenter} y2={radarCenter + radarMax} stroke="#edf1ed" strokeWidth="1" />
                      <line x1={radarCenter - radarMax} y1={radarCenter} x2={radarCenter + radarMax} y2={radarCenter} stroke="#edf1ed" strokeWidth="1" />
                      <polygon
                        points={radarPoints}
                        fill="rgba(0, 138, 82, 0.16)"
                        stroke="#008a52"
                        strokeWidth="2"
                      />
                      {radarAxes.map((a, idx) => {
                        const r = Math.max(0.08, a.val) * radarMax;
                        return (
                          <circle
                            key={idx}
                            cx={radarCenter + a.dx * r}
                            cy={radarCenter + a.dy * r}
                            r="3.2"
                            fill="#008a52"
                          />
                        );
                      })}
                      <text x={radarCenter} y="20" textAnchor="middle" fontSize="10" fill="#5d635d" fontWeight="600">
                        Comm
                      </text>
                      <text x="160" y={radarCenter + 3} textAnchor="middle" fontSize="10" fill="#5d635d" fontWeight="600">
                        Role
                      </text>
                      <text x={radarCenter} y="168" textAnchor="middle" fontSize="10" fill="#5d635d" fontWeight="600">
                        Problem
                      </text>
                      <text x="20" y={radarCenter + 3} textAnchor="middle" fontSize="10" fill="#5d635d" fontWeight="600">
                        Clarity
                      </text>
                    </svg>
                  </div>

                  {/* Executive Summary */}
                  <div className="lg:col-span-5 p-6 rounded-2xl border border-[#e2e7e1] bg-white flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-[14px] font-semibold text-[#171917]">
                        <span className="w-7 h-7 rounded-lg bg-[#eef5ef] text-[#008a52] flex items-center justify-center">
                          <Award className="w-4 h-4" />
                        </span>
                        Executive Summary
                      </div>
                      <p className="text-[13.5px] text-[#414740] leading-relaxed">
                        {evaluation.summary}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#edf1ed] flex items-center justify-between text-[12px] text-[#5d635d]">
                      <span>Rubric Scale</span>
                      <span className="font-medium text-[#171917]">1 (Needs work) – 5 (Strong)</span>
                    </div>
                  </div>
                </div>

                {/* 4 Dimensions */}
                {evaluation.dimensions && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dimConfigs.map((dim) => {
                      const item = evaluation.dimensions[dim.key];
                      if (!item) return null;
                      const IconComp = dim.icon;
                      const barColor =
                        item.score >= 4
                          ? "#00c875"
                          : item.score >= 2.5
                          ? "#d97706"
                          : "#ba1a1a";
                      const badgeCls =
                        item.score >= 4
                          ? "bg-[#eef5ef] text-[#008a52]"
                          : item.score >= 2.5
                          ? "bg-[#fff8eb] text-[#b45309]"
                          : "bg-[#fdecec] text-[#ba1a1a]";

                      return (
                        <div
                          key={dim.key}
                          className="p-5 rounded-2xl border border-[#e2e7e1] bg-white space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-2.5 text-[14px] font-semibold text-[#171917]">
                              <span className="w-7 h-7 rounded-lg bg-[#fafbf9] border border-[#e2e7e1] flex items-center justify-center text-[#5d635d]">
                                <IconComp className="w-3.5 h-3.5" />
                              </span>
                              {dim.label}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[12px] font-semibold tabular-nums ${badgeCls}`}
                            >
                              {item.score} / 5
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#eef1ee] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${(item.score / 5) * 100}%`,
                                backgroundColor: barColor,
                              }}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-6 rounded-2xl border border-[#e2e7e1] bg-white space-y-3.5">
                    <h3 className="text-[15px] font-semibold text-[#171917] flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-[#eef5ef] text-[#008a52] flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                      Key Strengths
                    </h3>
                    <ul className="space-y-2.5 text-[13.5px] text-[#414740]">
                      {(evaluation.strengths || []).map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#008a52] mt-2 shrink-0" />
                          <span className="leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl border border-[#e2e7e1] bg-white space-y-3.5">
                    <h3 className="text-[15px] font-semibold text-[#171917] flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-[#eff6ff] text-[#0284c7] flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </span>
                      Areas to Improve
                    </h3>
                    <ul className="space-y-2.5 text-[13.5px] text-[#414740]">
                      {(evaluation.improvements || []).map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] mt-2 shrink-0" />
                          <span className="leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Per-Question Breakdown */}
                {evaluation.questionFeedback?.length > 0 && (
                  <div className="p-6 rounded-2xl border border-[#e2e7e1] bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[15px] font-semibold text-[#171917] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#5d635d]" />
                        Question-by-Question Breakdown
                      </h3>
                      <span className="text-[12px] text-[#5d635d]">
                        {evaluation.questionFeedback.length} evaluated
                      </span>
                    </div>
                    <div className="space-y-3">
                      {evaluation.questionFeedback.map((qf, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-[#fafbf9] border border-[#e2e7e1] space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#171917]">
                              <span className="w-5 h-5 rounded-md bg-white border border-[#e2e7e1] text-[11px] font-semibold text-[#5d635d] flex items-center justify-center tabular-nums">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              {qf.topic}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#eef5ef] text-[12px] font-semibold text-[#008a52] tabular-nums">
                              {qf.score} / 5
                            </span>
                          </div>
                          <p className="text-[13px] text-[#566059] leading-relaxed">
                            {qf.answerSummary}
                          </p>
                          <div className="flex items-start gap-2 text-[12.5px] text-[#0d5216] bg-[#eef5ef] px-3 py-2 rounded-lg">
                            <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#008a52]" />
                            <span>{qf.tip}</span>
                          </div>
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
                className="w-full px-6 py-4 flex items-center justify-between text-[14px] font-semibold text-[#171917] bg-transparent border-none cursor-pointer hover:bg-[#fafbf9] transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#5d635d]" />
                  Full Interview Transcript
                  <span className="text-[12px] font-normal text-[#5d635d]">
                    ({session.messages?.length || 0} messages)
                  </span>
                </span>
                {showReportTranscript ? (
                  <ChevronUp className="w-4 h-4 text-[#5d635d]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#5d635d]" />
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
        );
      })()}
    </div>
  );
}
