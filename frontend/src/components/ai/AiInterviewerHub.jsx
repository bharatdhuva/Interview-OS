import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Upload,
  FileText,
  Cpu,
  Users,
  Mic,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  Play,
  BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/hooks/useToast";
import api from "@/lib/api";

export default function AiInterviewerHub({ user }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [providerStatus, setProviderStatus] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Setup state
  const [interviewType, setInterviewType] = useState("technical");
  const [difficulty, setDifficulty] = useState(
    user?.experienceLevel === "senior" || user?.experienceLevel === "staff"
      ? "senior"
      : user?.experienceLevel === "student" || user?.experienceLevel === "junior"
      ? "junior"
      : "mid"
  );
  const [targetRole, setTargetRole] = useState(user?.targetRole || "");
  const [focusArea, setFocusArea] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(6);

  // Resume state
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [parsedSkills, setParsedSkills] = useState(user?.skills || []);
  const [showPasteResume, setShowPasteResume] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const loadData = async () => {
    try {
      setLoadingSessions(true);
      const [statusRes, sessionsRes] = await Promise.all([
        api.get("/ai-interview/status"),
        api.get("/ai-interview/sessions"),
      ]);
      setProviderStatus(statusRes.data.data);
      setSessions(sessionsRes.data.data || []);
    } catch (err) {
      console.error("Failed to load AI interviewer data", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResumeFile = async (file) => {
    if (!file) return;
    setParsingResume(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await api.post("/ai-interview/parse-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data.data;
      setResumeFileName(data.fileName);
      setResumeText(data.rawText);
      if (data.parsedSkills?.length) {
        setParsedSkills(data.parsedSkills);
      }
      toast({
        title: "Resume parsed",
        description: `Extracted ${data.charCount.toLocaleString()} characters and ${data.parsedSkills?.length || 0} skills.`,
      });
    } catch (err) {
      toast({
        title: "Resume parse failed",
        description: err.response?.data?.message || "Try a PDF, TXT, or MD file, or paste your resume text.",
        variant: "destructive",
      });
    } finally {
      setParsingResume(false);
    }
  };

  const handleParsePastedText = async () => {
    if (!resumeText.trim()) return;
    setParsingResume(true);
    try {
      const res = await api.post("/ai-interview/parse-resume", {
        resumeText,
      });
      const data = res.data.data;
      setResumeFileName("pasted-resume.txt");
      setResumeText(data.rawText);
      if (data.parsedSkills?.length) {
        setParsedSkills(data.parsedSkills);
      }
      toast({
        title: "Resume processed",
        description: `Detected ${data.parsedSkills?.length || 0} skills from your resume.`,
      });
    } catch (err) {
      toast({
        title: "Could not process resume",
        description: err.response?.data?.message || "Please check your text.",
        variant: "destructive",
      });
    } finally {
      setParsingResume(false);
    }
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      toast({
        title: "Upload or paste your resume",
        description: "The AI interviewer tailors questions directly to your resume.",
        variant: "destructive",
      });
      return;
    }

    setCreatingSession(true);
    try {
      const res = await api.post("/ai-interview/sessions", {
        interviewType,
        difficulty,
        targetRole: targetRole.trim(),
        focusArea: focusArea.trim(),
        totalQuestions,
        resumeText,
        resumeFileName,
        parsedSkills,
      });
      const created = res.data.data;
      navigate(`/ai-interview/${created.sessionId}`);
    } catch (err) {
      toast({
        title: "Failed to create session",
        description: err.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingSession(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.delete(`/ai-interview/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      toast({ title: "Session removed" });
    } catch {
      toast({ title: "Could not delete session", variant: "destructive" });
    }
  };

  return (
    <div className="pt-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#eef5ef] text-[#008a52] text-[11px] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Voice-Enabled AI Mock Studio
          </div>
          <h2 className="text-[24px] font-semibold text-[#171917] tracking-[-0.02em]">
            AI Voice Interviewer
          </h2>
          <p className="text-[14px] text-[#566059] mt-1">
            Upload your resume, choose Technical or HR mode, and practice a real-time spoken interview with instant rubric feedback.
          </p>
        </div>

        {providerStatus && (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium border shrink-0 ${
              providerStatus.configured
                ? "bg-[#eef5ef] border-[#c4e3cc] text-[#008a52]"
                : "bg-[#fff8eb] border-[#f3d9a4] text-[#8a5a00]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                providerStatus.configured ? "bg-[#00c875]" : "bg-[#e09f1f]"
              }`}
            />
            {providerStatus.configured
              ? `AI Ready (${providerStatus.activeProvider})`
              : "API Key Pending"}
          </div>
        )}
      </div>

      {providerStatus && !providerStatus.configured && (
        <div className="p-4 rounded-xl border border-[#f3d9a4] bg-[#fffaf0] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#b7791f] shrink-0 mt-0.5" />
          <div className="text-[13px] text-[#5c4311] leading-relaxed">
            <span className="font-semibold text-[#171917]">AI provider key not configured yet.</span>{" "}
            You can upload &amp; parse your resume and configure your session now. Add{" "}
            <code className="px-1.5 py-0.5 rounded bg-[#f5ebd6] text-[12px]">GROQ_API_KEY</code>,{" "}
            <code className="px-1.5 py-0.5 rounded bg-[#f5ebd6] text-[12px]">GEMINI_API_KEY</code>, or{" "}
            <code className="px-1.5 py-0.5 rounded bg-[#f5ebd6] text-[12px]">OPENAI_API_KEY</code> in{" "}
            <code className="px-1.5 py-0.5 rounded bg-[#f5ebd6] text-[12px]">backend/.env</code> to activate live AI voice responses.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Setup Form */}
        <form onSubmit={handleStartInterview} className="lg:col-span-8 space-y-6">
          {/* Step 1: Resume Upload */}
          <div className="p-6 rounded-2xl border border-[#e2e7e1] bg-white space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#707870]">
                  Step 1
                </p>
                <h3 className="text-[16px] font-semibold text-[#171917]">
                  Upload Your Resume
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasteResume((v) => !v)}
                className="text-[12.5px] font-medium text-[#008a52] hover:underline bg-transparent border-none cursor-pointer"
              >
                {showPasteResume ? "Upload file instead" : "Or paste text"}
              </button>
            </div>

            {!showPasteResume ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped) handleResumeFile(dropped);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-[#00c875] bg-[#eef5ef]/60"
                    : resumeText
                    ? "border-[#008a52]/40 bg-[#fafcfa]"
                    : "border-[#d8dfd8] hover:border-[#008a52] bg-[#fafbf9]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  className="hidden"
                  onChange={(e) => handleResumeFile(e.target.files?.[0])}
                />
                {parsingResume ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2 className="w-6 h-6 text-[#008a52] animate-spin" />
                    <p className="text-[13.5px] text-[#414740]">Parsing resume...</p>
                  </div>
                ) : resumeText ? (
                  <div className="flex flex-col items-center gap-2 py-1">
                    <CheckCircle2 className="w-6 h-6 text-[#008a52]" />
                    <p className="text-[14px] font-semibold text-[#171917]">
                      {resumeFileName || "Resume loaded"}
                    </p>
                    <p className="text-[12.5px] text-[#566059]">
                      {resumeText.length.toLocaleString()} characters extracted · Click to replace
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="w-10 h-10 rounded-full bg-[#eef5ef] text-[#008a52] flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-[14px] font-medium text-[#171917]">
                      Drop your resume here, or <span className="text-[#008a52]">browse</span>
                    </p>
                    <p className="text-[12px] text-[#707870]">
                      Supports PDF, TXT, or Markdown (max 5 MB)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text, experience, and key projects here..."
                  className="min-h-[140px] bg-[#fafbf9] border-[#e2e7e1] text-[13.5px]"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleParsePastedText}
                    disabled={parsingResume || !resumeText.trim()}
                    className="px-4 h-8 rounded-full border border-[#171917] text-[12px] font-semibold text-[#171917] hover:bg-[#eef5ef] disabled:opacity-40 cursor-pointer bg-transparent"
                  >
                    {parsingResume ? "Processing..." : "Extract Skills"}
                  </button>
                </div>
              </div>
            )}

            {parsedSkills.length > 0 && (
              <div className="pt-1">
                <p className="text-[11.5px] text-[#707870] mb-2">
                  Detected skills &amp; topics:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {parsedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded bg-[#eef5ef] text-[#008a52] text-[12px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Interviewer Type */}
          <div className="p-6 rounded-2xl border border-[#e2e7e1] bg-white space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#707870]">
                Step 2
              </p>
              <h3 className="text-[16px] font-semibold text-[#171917]">
                Choose Interviewer Mode
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: "technical",
                  title: "Technical Interviewer",
                  persona: "Alex · Senior Staff Engineer",
                  desc: "Architecture, system design, debugging, core CS & deep-dives into your resume projects.",
                  icon: Cpu,
                },
                {
                  id: "hr",
                  title: "HR / Behavioral Interviewer",
                  persona: "Maya · Senior People Partner",
                  desc: "STAR-method scenarios, leadership, conflict resolution, ownership & culture fit.",
                  icon: Users,
                },
              ].map((mode) => {
                const Icon = mode.icon;
                const selected = interviewType === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setInterviewType(mode.id)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      selected
                        ? "border-[#008a52] bg-[#f4fbf6] ring-1 ring-[#008a52]"
                        : "border-[#e2e7e1] bg-[#fafbf9] hover:border-[#bfcaba]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          selected
                            ? "bg-[#00c875] text-[#080a09]"
                            : "bg-[#eef1ee] text-[#414740]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selected
                            ? "border-[#008a52] bg-[#008a52]"
                            : "border-[#c4ccc4]"
                        }`}
                      >
                        {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <div className="text-[14.5px] font-semibold text-[#171917]">
                      {mode.title}
                    </div>
                    <div className="text-[12px] text-[#008a52] font-medium mt-0.5">
                      {mode.persona}
                    </div>
                    <p className="text-[12.5px] text-[#566059] mt-2 leading-relaxed">
                      {mode.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Session Settings */}
          <div className="p-6 rounded-2xl border border-[#e2e7e1] bg-white space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#707870]">
                Step 3
              </p>
              <h3 className="text-[16px] font-semibold text-[#171917]">
                Session Calibration
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Target Role</Label>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Full-Stack Engineer"
                  className="mt-1 bg-[#fafbf9] border-[#e2e7e1]"
                />
              </div>
              <div>
                <Label>Experience Level</Label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-[#e2e7e1] bg-[#fafbf9] text-sm text-[#171917]"
                >
                  <option value="junior">Junior (0–2 yrs)</option>
                  <option value="mid">Mid-Level (2–5 yrs)</option>
                  <option value="senior">Senior / Staff (5+ yrs)</option>
                </select>
              </div>
              <div>
                <Label>Focus Area (optional)</Label>
                <Input
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder={
                    interviewType === "technical"
                      ? "e.g. Distributed Systems, React"
                      : "e.g. Leadership, Conflict Resolution"
                  }
                  className="mt-1 bg-[#fafbf9] border-[#e2e7e1]"
                />
              </div>
              <div>
                <Label>Interview Length</Label>
                <select
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(Number(e.target.value))}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-[#e2e7e1] bg-[#fafbf9] text-sm text-[#171917]"
                >
                  <option value={4}>Quick (4 questions · ~8 min)</option>
                  <option value={6}>Standard (6 questions · ~15 min)</option>
                  <option value={8}>Deep Dive (8 questions · ~22 min)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e2e7e1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[12.5px] text-[#566059]">
                <Mic className="w-4 h-4 text-[#008a52]" />
                Voice mode uses your browser mic &amp; speaker (with text fallback).
              </div>
              <button
                type="submit"
                disabled={creatingSession || !resumeText.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-full bg-[#080a09] hover:bg-[#242925] disabled:opacity-40 text-white text-[13.5px] font-semibold transition-colors cursor-pointer shrink-0"
              >
                {creatingSession ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Studio...
                  </>
                ) : (
                  <>
                    Launch Voice Interview <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Right Column: Recent Sessions */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl border border-[#e2e7e1] bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#171917]">
                Recent AI Sessions
              </h3>
              <span className="text-[12px] text-[#707870] tabular-nums">
                {sessions.length}
              </span>
            </div>

            {loadingSessions ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl bg-[#f4f6f3] animate-pulse"
                  />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <FileText className="w-6 h-6 text-[#9aa39b] mx-auto" />
                <p className="text-[13px] text-[#566059]">
                  No AI mock sessions yet. Upload your resume to start your first voice interview.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sessions.map((s) => (
                  <div
                    key={s.sessionId}
                    className="p-3.5 rounded-xl border border-[#e2e7e1] bg-[#fafbf9] hover:border-[#bfcaba] transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10.5px] font-semibold uppercase ${
                              s.interviewType === "technical"
                                ? "bg-[#e3f4e8] text-[#0d5216]"
                                : "bg-[#e8f0fe] text-[#1a4fa3]"
                            }`}
                          >
                            {s.interviewType}
                          </span>
                          <span className="text-[11.5px] text-[#707870] capitalize">
                            {s.difficulty}
                          </span>
                        </div>
                        <p className="text-[13.5px] font-medium text-[#171917] mt-1">
                          {s.targetRole || (s.interviewType === "technical" ? "Technical Mock" : "HR Behavioral Mock")}
                        </p>
                        <p className="text-[11.5px] text-[#707870]">
                          {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(s.sessionId)}
                        className="p-1 text-[#828b83] hover:text-[#ba1a1a] bg-transparent border-none cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {s.status === "completed" && s.evaluation ? (
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#008a52]">
                          <BarChart3 className="w-3.5 h-3.5" />
                          Score: {s.evaluation.overallScore}/100
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-[#707870] capitalize">
                          {s.status === "active"
                            ? `In progress (${s.currentQuestionIndex}/${s.totalQuestions})`
                            : "Ready to start"}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => navigate(`/ai-interview/${s.sessionId}`)}
                        className="inline-flex items-center gap-1 px-3 h-7 rounded-full bg-[#171917] hover:bg-[#2a2e2a] text-white text-[11.5px] font-medium cursor-pointer"
                      >
                        {s.status === "completed" ? (
                          "View Report"
                        ) : (
                          <>
                            <Play className="w-3 h-3" /> {s.status === "active" ? "Resume" : "Start"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
