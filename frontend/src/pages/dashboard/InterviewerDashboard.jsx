import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Plus,
  Calendar,
  Clock,
  Users,
  Copy,
  ArrowRight,
  ArrowUpRight,
  LogOut,
  X,
  AlertCircle,
  BarChart3,
  Sparkles,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Check,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useAuthStore } from "@/store/authStore";
import CustomSelect from "@/components/ui/CustomSelect";
import SegmentedControl from "@/components/ui/SegmentedControl";
import DateTimePicker from "@/components/ui/DateTimePicker";
import { useToast } from "@/hooks/useToast";
import api from "@/lib/api";
import { createRoomSchema } from "@/lib/validations";

const getSessionStorageKey = (roomId) => `interviewos:room-session:${roomId}`;

const normalizeUser = (value, fallbackRole) => {
  if (!value || typeof value === "string") return undefined;
  return {
    id: value._id || value.id || "",
    name: value.name || "",
    email: value.email || "",
    role: value.role || fallbackRole,
    avatar: value.avatar || "",
    isEmailVerified: value.isEmailVerified ?? true,
    createdAt: value.createdAt || new Date().toISOString(),
  };
};

const mapApiRoomToRoom = (room, currentUser, fallbackCandidateEmail) => {
  const interviewer = normalizeUser(room.interviewer, "interviewer") ||
    currentUser || {
      id: "",
      name: "Interviewer",
      email: "",
      role: "interviewer",
      avatar: "",
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    };
  const candidate = normalizeUser(room.candidate, "candidate");
  return {
    id: room._id || room.id || room.roomId,
    roomId: room.roomId,
    title: room.title,
    description: room.description,
    interviewer,
    candidate,
    candidateEmail:
      candidate?.email || room.candidateEmail || fallbackCandidateEmail || "",
    scheduledAt: room.scheduledAt,
    durationMinutes: room.durationMinutes,
    status: room.status,
    problemStatement: room.problemStatement,
    techStack: room.techStack || [],
    difficultyLevel: room.difficultyLevel || "medium",
    createdAt: room.createdAt || new Date().toISOString(),
  };
};

const statusLabel = {
  scheduled: { label: "Scheduled", dot: "bg-[#0284c7]" },
  active: { label: "Live now", dot: "bg-[#00c875]" },
  completed: { label: "Completed", dot: "bg-[#828b83]" },
  cancelled: { label: "Cancelled", dot: "bg-[#ba1a1a]" },
};

function InterviewerRoomRow({
  room,
  startingRoomId,
  onStartRoom,
  onCopyInvite,
  onNavigate,
}) {
  const status = statusLabel[room.status] || statusLabel.scheduled;
  return (
    <div className="py-5 border-b border-[#e2e7e1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <h3 className="text-[16px] font-semibold text-[#171917] tracking-[-0.01em]">
            {room.title}
          </h3>
          <span className="text-[12px] text-[#707870]">· {status.label}</span>
          <span className="text-[11px] uppercase tracking-wider text-[#707870] border border-[#e2e7e1] px-1.5 py-0.5 rounded capitalize">
            {room.difficultyLevel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#566059]">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#707870]" />
            {format(new Date(room.scheduledAt), "MMM d, yyyy")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#707870]" />
            {format(new Date(room.scheduledAt), "h:mm a")} · {room.durationMinutes}m
          </span>
          {room.candidateEmail && (
            <span className="inline-flex items-center gap-1.5 break-all">
              <Users className="w-3.5 h-3.5 text-[#707870] shrink-0" />
              {room.candidateEmail}
            </span>
          )}
        </div>

        {room.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {room.techStack.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[11px] rounded bg-[#eef5ef] text-[#008a52] font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onCopyInvite(room.roomId)}
          className="h-9 w-9 rounded-full border border-[#e2e7e1] text-[#566059] hover:text-[#171917] hover:border-[#bfcaba] inline-flex items-center justify-center transition-colors bg-transparent cursor-pointer"
          title="Copy invite link"
          aria-label="Copy invite link"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {room.status === "scheduled" && (
          <button
            type="button"
            disabled={startingRoomId === room.id}
            onClick={() => onStartRoom(room)}
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-[#080a09] hover:bg-[#242925] disabled:opacity-50 text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            {startingRoomId === room.id ? "Starting..." : "Start"}{" "}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {room.status === "active" && (
          <button
            type="button"
            onClick={() => onNavigate(`/room/${room.roomId}`)}
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-[#008a52] hover:bg-[#007344] text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            Rejoin <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {room.status === "completed" && (
          <>
            <button
              type="button"
              onClick={() => onNavigate(`/feedback/${room.roomId}`)}
              className="px-4 h-9 rounded-full border border-[#171917] text-[#171917] hover:bg-[#eef5ef] text-[13px] font-semibold transition-colors cursor-pointer bg-transparent"
            >
              Feedback / AI Draft
            </button>
            <button
              type="button"
              onClick={() => onNavigate(`/room/${room.roomId}/replay`)}
              className="px-4 h-9 rounded-full border border-[#e2e7e1] text-[#566059] hover:text-[#171917] hover:border-[#bfcaba] text-[13px] font-medium transition-colors cursor-pointer bg-transparent"
            >
              Replay
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function InterviewerDashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const [activeNav, setActiveNav] = useState("overview"); // "overview" | "interviews" | "evaluations" | "ai-copilot" | "question-bank"
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState("all");
  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [startingRoomId, setStartingRoomId] = useState(null);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filtered =
    filter === "all" ? rooms : rooms.filter((r) => r.status === filter);
  const completedRooms = rooms.filter((r) => r.status === "completed");
  const candidateCount = new Set(
    rooms.map((room) => room.candidateEmail).filter(Boolean)
  ).size;

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");
    if (justLoggedIn === "true") {
      if (typeof window === "undefined" || window.innerWidth >= 768) {
        toast({
          title: `Welcome back, ${user?.name?.split(" ")[0] || "there"}`,
          description: "Your interviewer workspace is ready.",
        });
      }
      sessionStorage.removeItem("justLoggedIn");
    }
  }, [user, toast]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoadingRooms(true);
        const response = await api.get("/rooms");
        const nextRooms = (response.data.data || []).map((room) =>
          mapApiRoomToRoom(room, user)
        );
        setRooms(nextRooms);
      } catch (error) {
        toast({
          title: "Failed to load rooms",
          description:
            error?.response?.data?.message ||
            "Unable to fetch interview rooms right now.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingRooms(false);
      }
    };
    loadRooms();
  }, [toast, user]);

  const handleCreateRoom = async (data) => {
    if (!user) {
      toast({
        title: "Unable to create room",
        description: "Please sign in again and retry.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await api.post("/rooms", {
        title: data.title.trim(),
        description: data.problemStatement.trim(),
        candidateEmail: data.candidateEmail.trim(),
        scheduledAt: new Date(data.dateTime).toISOString(),
        durationMinutes: Number(data.duration),
        problemStatement: data.problemStatement.trim(),
        techStack: data.techStack
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        difficultyLevel: data.difficulty,
      });
      const createdRoom = mapApiRoomToRoom(
        response.data.data,
        user,
        data.candidateEmail.trim()
      );
      setRooms((prev) => [createdRoom, ...prev]);
      setShowCreate(false);
      toast({
        title: "Room created!",
        description: "The interview room is now available in your list.",
      });
    } catch (error) {
      toast({
        title: "Unable to create room",
        description: error?.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartRoom = async (room) => {
    try {
      setStartingRoomId(room.id);
      const response = await api.post(`/rooms/${room.id}/start`);
      const sessionId = response.data.data?._id || response.data.data?.id;
      if (sessionId) {
        sessionStorage.setItem(getSessionStorageKey(room.roomId), sessionId);
      }
      setRooms((prev) =>
        prev.map((item) =>
          item.id === room.id ? { ...item, status: "active" } : item
        )
      );
      navigate(`/room/${room.roomId}`);
    } catch (error) {
      toast({
        title: "Unable to start room",
        description: error?.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setStartingRoomId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const copyInvite = (roomId) => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    toast({ title: "Invite link copied!" });
  };

  return (
    <div
      className="interviewer-workspace min-h-screen bg-[#fafbf9] text-[#171917] flex flex-col"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
      }}
    >
      <style>{`
        .interviewer-workspace h1,
        .interviewer-workspace h2,
        .interviewer-workspace h3,
        .interviewer-workspace h4 {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
        }
      `}</style>

      {/* Single Persistent Top Bar */}
      <header className="sticky top-0 z-40 h-[64px] w-full bg-[#fafbf9]/90 backdrop-blur-md border-b border-[#e2e7e1] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="hidden md:inline-flex p-1.5 rounded-lg text-[#566059] hover:text-[#171917] hover:bg-[#eef5ef] transition-colors bg-transparent border-none cursor-pointer"
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>
          <Link
            to="/dashboard/interviewer"
            onClick={() => setActiveNav("overview")}
            className="inline-flex items-center gap-[5px] text-[#111111] text-[19px] font-bold tracking-[-0.01em] leading-none"
          >
            InterviewOS
            <span
              className="inline-block w-[7px] h-[15px] bg-[#00c875]"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="hidden md:inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#080a09] hover:bg-[#242925] text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create Room
          </button>
          <div className="h-4 w-[1px] bg-[#e2e7e1] hidden sm:block" />
          <span className="text-[13.5px] font-medium text-[#171917] hidden sm:inline">
            {user?.name}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#566059] hover:text-[#171917] hover:bg-[#f4f6f3] transition-colors bg-transparent border-none cursor-pointer"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile: Live Interviewer / Coding Studio is desktop-only; route to AI Voice Interviewer */}
      <div
        className="md:hidden flex-1 flex flex-col justify-center px-6 py-12"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(202, 250, 222, 0.55), transparent 65%), linear-gradient(180deg, #f5fbf6 0%, #fafbf9 80%)",
        }}
      >
        <div className="max-w-sm mx-auto space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#008a52]">
            Mobile Experience
          </p>
          <h1 className="text-[28px] leading-[1.1] font-semibold tracking-[-0.03em] text-[#171917]">
            Practice with the AI Voice Interviewer.
          </h1>
          <p className="text-[14px] text-[#566059] leading-relaxed">
            Live interviewer rooms and collaborative code sessions require a desktop browser. On mobile, you can launch the AI Voice Interviewer directly.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard/candidate")}
            className="w-full h-12 rounded-full bg-[#080a09] text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            Start AI Interview <ArrowUpRight className="w-4 h-4 text-[#00c875]" />
          </button>
        </div>
      </div>

      {/* Desktop Interviewer Workspace (>= 768px) */}
      <div className="hidden md:flex flex-1 min-h-0">
        {/* Smoothly Collapsible Left Workspace Sidebar */}
        <aside
          className={`hidden md:flex shrink-0 flex-col justify-between bg-white sticky top-[64px] h-[calc(100vh-64px)] overflow-hidden transition-all duration-300 ease-out ${
            sidebarOpen
              ? "w-[228px] border-r border-[#e2e7e1] px-4 py-5 opacity-100"
              : "w-0 border-r-0 px-0 py-5 opacity-0 pointer-events-none"
          }`}
        >
          <div className="w-[196px]">
            <p className="px-2.5 text-[10.5px] uppercase tracking-[0.12em] text-[#828b83] mb-2 whitespace-nowrap">
              Interviewer workspace
            </p>
            <nav className="space-y-1">
              {[
                { id: "overview", label: "Overview", icon: Users },
                { id: "interviews", label: "Interviews", icon: Calendar },
                { id: "evaluations", label: "Evaluations", icon: BarChart3 },
                { id: "ai-copilot", label: "AI Co-Pilot", icon: Sparkles, soon: true },
                { id: "question-bank", label: "Question Bank", icon: FileText, soon: true },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-[#e3f4e8] text-[#0d5216]"
                        : "text-[#566059] hover:bg-[#f4f6f3] hover:text-[#171917]"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </span>
                    {item.soon ? (
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#eff1ee] text-[#717b73]">
                        Soon
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <main className="w-full max-w-[1060px] mx-auto px-6 py-9">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#e2e7e1]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.13em] text-[#657168] mb-2">
                  Interviewer workspace
                </p>
                <h1 className="text-[34px] leading-[1.06] font-semibold tracking-[-0.04em] text-[#171917]">
                  Manage your interviews.
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-full bg-[#080a09] hover:bg-[#242925] text-white text-[13.5px] font-semibold transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> New Interview Room
              </button>
            </div>

            {activeNav === "ai-copilot" ? (
              <div className="py-12 max-w-2xl">
                <span className="inline-block px-2.5 py-1 rounded bg-[#eff1ee] text-[#717b73] text-[11px] font-medium mb-4">
                  Coming soon · Phase 5
                </span>
                <h2 className="text-[24px] font-semibold text-[#171917] tracking-[-0.02em] mb-2">
                  Private Interviewer AI Co-Pilot
                </h2>
                <p className="text-[14.5px] text-[#566059] leading-relaxed">
                  A live, interviewer-only sidebar inside the room that streams suggested follow-up questions, complexity estimates, edge-case checks, and an escalating hint ladder—never visible to candidates.
                </p>
              </div>
            ) : activeNav === "question-bank" ? (
              <div className="py-12 max-w-2xl">
                <span className="inline-block px-2.5 py-1 rounded bg-[#eff1ee] text-[#717b73] text-[11px] font-medium mb-4">
                  Coming soon · Phase 8
                </span>
                <h2 className="text-[24px] font-semibold text-[#171917] tracking-[-0.02em] mb-2">
                  RAG Problem &amp; Rubric Bank
                </h2>
                <p className="text-[14.5px] text-[#566059] leading-relaxed">
                  Search original coding and system design problems matched to your job description and role, complete with expected edge cases and grading rubrics.
                </p>
              </div>
            ) : activeNav === "evaluations" ? (
              <div className="py-10 space-y-6">
                <div>
                  <h2 className="text-[20px] font-semibold text-[#171917] mb-1">
                    AI Evaluation Drafts &amp; Feedback
                  </h2>
                  <p className="text-[14px] text-[#566059]">
                    Generate an evidence-linked AI draft after any completed interview, edit ratings, and share with the candidate.
                  </p>
                </div>
                {completedRooms.length > 0 ? (
                  <div>
                    {completedRooms.map((room) => (
                      <InterviewerRoomRow
                        key={room.id}
                        room={room}
                        startingRoomId={startingRoomId}
                        onStartRoom={handleStartRoom}
                        onCopyInvite={copyInvite}
                        onNavigate={navigate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl border border-[#e2e7e1] bg-white text-[14px] text-[#566059]">
                    No completed interviews yet. Once you end an interview session, you can generate an AI evaluation draft and inspect its replay evidence here.
                  </div>
                )}
              </div>
            ) : (
              /* Default Overview & Interviews */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center gap-6 border-b border-[#e2e7e1] pb-3 overflow-x-auto">
                    {[
                      { id: "all", label: `All (${rooms.length})` },
                      { id: "scheduled", label: "Scheduled" },
                      { id: "active", label: "Live" },
                      { id: "completed", label: "Completed" },
                      { id: "cancelled", label: "Cancelled" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilter(tab.id)}
                        className={`text-[13.5px] font-medium pb-3 -mb-[13px] border-b-2 transition-colors bg-transparent cursor-pointer whitespace-nowrap ${
                          filter === tab.id
                            ? "border-[#008a52] text-[#171917]"
                            : "border-transparent text-[#707870] hover:text-[#171917]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {isLoadingRooms ? (
                    <div className="space-y-4 py-4">
                      {[1, 2].map((n) => (
                        <div
                          key={n}
                          className="py-5 border-b border-[#e2e7e1] animate-pulse space-y-2"
                        >
                          <div className="h-5 w-48 bg-[#eceeec] rounded" />
                          <div className="h-4 w-72 bg-[#eceeec] rounded" />
                        </div>
                      ))}
                    </div>
                  ) : filtered.length > 0 ? (
                    <div>
                      {filtered.map((room) => (
                        <InterviewerRoomRow
                          key={room.id}
                          room={room}
                          startingRoomId={startingRoomId}
                          onStartRoom={handleStartRoom}
                          onCopyInvite={copyInvite}
                          onNavigate={navigate}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 border-b border-[#e2e7e1]">
                      <h2 className="text-[18px] font-semibold text-[#171917] mb-1.5">
                        {rooms.length === 0
                          ? "No interviews scheduled yet"
                          : "No interviews match this filter"}
                      </h2>
                      <p className="text-[14px] text-[#566059] max-w-md leading-relaxed mb-5">
                        {rooms.length === 0
                          ? "Create your first interview room to invite a candidate, collaborate live on code and whiteboard, and generate AI evaluation drafts."
                          : "Switch tabs above or create a new interview room."}
                      </p>
                      {rooms.length === 0 && (
                        <button
                          type="button"
                          onClick={() => setShowCreate(true)}
                          className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full bg-[#080a09] hover:bg-[#242925] text-white text-[13px] font-semibold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Create Interview Room
                        </button>
                      )}
                    </div>
                  )}

                  {activeNav === "overview" && (
                    <div className="space-y-3 pt-2">
                      <div className="p-5 rounded-xl border border-[#e2e7e1] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[14px] font-semibold text-[#171917]">
                              Live AI Co-Pilot
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-[#eff1ee] text-[#717b73]">
                              Coming soon
                            </span>
                          </div>
                          <p className="text-[13px] text-[#566059]">
                            Private follow-up questions, complexity estimates, and hint ladder streamed only to you during live interviews.
                          </p>
                        </div>
                      </div>

                      <div className="p-5 rounded-xl border border-[#e2e7e1] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[14px] font-semibold text-[#171917]">
                              Smart Question Bank
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-[#eff1ee] text-[#717b73]">
                              Coming soon
                            </span>
                          </div>
                          <p className="text-[13px] text-[#566059]">
                            Vector-retrieved coding and system design problems matched to role and tech stack.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side Rail */}
                <aside className="lg:col-span-4 space-y-6">
                  <div className="grid grid-cols-3 border border-[#e2e7e1] rounded-xl bg-white divide-x divide-[#e2e7e1]">
                    <div className="p-4">
                      <div className="text-[11px] uppercase tracking-wider text-[#707870]">
                        Total
                      </div>
                      <div className="text-[22px] font-semibold text-[#171917] mt-0.5 tabular-nums">
                        {rooms.length}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[11px] uppercase tracking-wider text-[#707870]">
                        Completed
                      </div>
                      <div className="text-[22px] font-semibold text-[#008a52] mt-0.5 tabular-nums">
                        {completedRooms.length}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[11px] uppercase tracking-wider text-[#707870]">
                        Candidates
                      </div>
                      <div className="text-[22px] font-semibold text-[#171917] mt-0.5 tabular-nums">
                        {candidateCount}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border border-[#e2e7e1] bg-white space-y-3">
                    <h2 className="text-[16px] font-semibold text-[#171917]">
                      Schedule an interview
                    </h2>
                    <p className="text-[13px] text-[#566059] leading-relaxed">
                      Set up a live room with Monaco editor, E2E-encrypted Excalidraw, Judge0 execution, and post-session AI evaluation drafts.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCreate(true)}
                      className="w-full h-9 rounded-full border border-[#171917] text-[#171917] hover:bg-[#eef5ef] text-[13px] font-semibold transition-colors cursor-pointer bg-transparent"
                    >
                      + Create Room
                    </button>
                  </div>

                  <div className="p-5 rounded-xl border border-[#e2e7e1] bg-white space-y-2.5">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#707870]">
                      Workflow checklist
                    </p>
                    {[
                      { label: "Create an interview room", done: rooms.length > 0 },
                      { label: "Conduct live session", done: completedRooms.length > 0 },
                      { label: "Review AI draft & share", done: completedRooms.length > 0 },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2.5 text-[13px] text-[#414740]"
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            item.done
                              ? "bg-[#eef5ef] text-[#008a52]"
                              : "border border-[#d9e0da] text-transparent"
                          }`}
                        >
                          <Check className="w-2.5 h-2.5" />
                        </span>
                        <span className={item.done ? "text-[#171917]" : "text-[#828b83]"}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateRoomModal
            onClose={() => setShowCreate(false)}
            onCreateRoom={handleCreateRoom}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Create Room Modal Component ─── */
function CreateRoomModal({ onClose, onCreateRoom }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createRoomSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      candidateEmail: "",
      dateTime: "",
      duration: "60",
      techStack: "",
      difficulty: "medium",
      problemStatement: "",
    },
  });

  const onSubmit = (data) => {
    onCreateRoom(data);
  };

  const FieldError = ({ message }) =>
    message ? (
      <motion.p
        initial={{ y: -4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-[11px] mt-1 flex items-center gap-1 text-[#ba1a1a]"
        role="alert"
      >
        <AlertCircle className="w-3 h-3" /> {message}
      </motion.p>
    ) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl bg-white border border-[#e2e7e1] p-6 max-h-[92vh] overflow-y-auto shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#171917]">
            Create Interview Room
          </h2>
          <button
            onClick={onClose}
            className="text-[#707870] hover:text-[#171917] bg-transparent border-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>
                  Title <span className="text-[#ba1a1a]">*</span>
                </Label>
                <Input
                  placeholder="Frontend Engineer — React Assessment"
                  className={`mt-1.5 bg-[#fafbf9] border-[#e2e7e1] ${
                    errors.title ? "!border-[#ba1a1a]" : ""
                  }`}
                  {...register("title")}
                />
                <FieldError message={errors.title?.message} />
              </div>

              <div>
                <Label>
                  Candidate Email <span className="text-[#ba1a1a]">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="candidate@example.com"
                  className={`mt-1.5 bg-[#fafbf9] border-[#e2e7e1] ${
                    errors.candidateEmail ? "!border-[#ba1a1a]" : ""
                  }`}
                  {...register("candidateEmail")}
                />
                <FieldError message={errors.candidateEmail?.message} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Date &amp; Time <span className="text-[#ba1a1a]">*</span>
                  </Label>
                  <Controller
                    name="dateTime"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        hasError={Boolean(errors.dateTime)}
                      />
                    )}
                  />
                  <FieldError message={errors.dateTime?.message} />
                </div>
                <div>
                  <Label>
                    Duration (min) <span className="text-[#ba1a1a]">*</span>
                  </Label>
                  <Controller
                    name="duration"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: "30", label: "30 min" },
                          { value: "45", label: "45 min" },
                          { value: "60", label: "60 min" },
                          { value: "90", label: "90 min" },
                        ]}
                        className={`mt-1.5 bg-[#fafbf9] border-[#e2e7e1] ${
                          errors.duration ? "!border-[#ba1a1a]" : ""
                        }`}
                      />
                    )}
                  />
                  <FieldError message={errors.duration?.message} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>
                  Tech Stack <span className="text-[#ba1a1a]">*</span>
                </Label>
                <Input
                  placeholder="React, TypeScript, Node.js"
                  className={`mt-1.5 bg-[#fafbf9] border-[#e2e7e1] ${
                    errors.techStack ? "!border-[#ba1a1a]" : ""
                  }`}
                  {...register("techStack")}
                />
                <FieldError message={errors.techStack?.message} />
              </div>

              <div>
                <Label>
                  Difficulty <span className="text-[#ba1a1a]">*</span>
                </Label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        {
                          value: "easy",
                          label: "Easy",
                          activeBg: "bg-[#008a52]",
                          activeText: "text-white",
                        },
                        {
                          value: "medium",
                          label: "Medium",
                          activeBg: "bg-amber-600",
                          activeText: "text-white",
                        },
                        {
                          value: "hard",
                          label: "Hard",
                          activeBg: "bg-rose-600",
                          activeText: "text-white",
                        },
                      ]}
                      className="mt-1.5"
                    />
                  )}
                />
                <FieldError message={errors.difficulty?.message} />
              </div>

              <div>
                <Label>
                  Problem Statement <span className="text-[#ba1a1a]">*</span>
                </Label>
                <Textarea
                  placeholder="Describe the coding problem (min 10 characters)..."
                  className={`mt-1.5 bg-[#fafbf9] border-[#e2e7e1] min-h-[92px] ${
                    errors.problemStatement ? "!border-[#ba1a1a]" : ""
                  }`}
                  {...register("problemStatement")}
                />
                <FieldError message={errors.problemStatement?.message} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#e2e7e1] pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-10 rounded-full border border-[#e2e7e1] text-[13px] font-medium text-[#171917] hover:bg-[#f4f6f3] cursor-pointer bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 h-10 rounded-full bg-[#080a09] hover:bg-[#242925] text-white text-[13px] font-semibold cursor-pointer"
            >
              Create Room
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
