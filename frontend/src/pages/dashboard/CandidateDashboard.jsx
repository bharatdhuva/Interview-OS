import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, isFuture, differenceInMinutes } from "date-fns";
import {
  Calendar,
  Clock,
  ArrowRight,
  LogOut,
  X,
  Loader2,
  ExternalLink,
  Check,
  LayoutGrid,
  Video,
  BarChart2,
  Sparkles,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import api from "@/lib/api";
import AiInterviewerHub from "@/components/ai/AiInterviewerHub";

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
  const interviewer = normalizeUser(room.interviewer, "interviewer") || {
    id: "",
    name: "Interviewer",
    email: "",
    role: "interviewer",
    avatar: "",
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
  };
  const candidate = normalizeUser(room.candidate, "candidate") ||
    currentUser || {
      id: "",
      name: "Candidate",
      email: "",
      role: "candidate",
      avatar: "",
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    };
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

function InterviewRow({ room }) {
  const navigate = useNavigate();
  const scheduledDate = new Date(room.scheduledAt);
  const minutesUntil = differenceInMinutes(scheduledDate, new Date());
  const canJoin =
    room.status === "active" ||
    (room.status === "scheduled" &&
      minutesUntil <= 10 &&
      minutesUntil >= -room.durationMinutes);
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
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#566059]">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#707870]" />
            {format(scheduledDate, "MMM d, yyyy")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#707870]" />
            {format(scheduledDate, "h:mm a")} · {room.durationMinutes}m
          </span>
          {room.interviewer?.name && (
            <span>with {room.interviewer.name}</span>
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

      <div className="flex items-center gap-2.5 shrink-0">
        {canJoin && (
          <button
            type="button"
            onClick={() => navigate(`/room/${room.roomId}`)}
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-[#080a09] hover:bg-[#242925] text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            Join Room <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        {room.status === "completed" && (
          <>
            <button
              type="button"
              onClick={() => navigate(`/feedback/${room.roomId}`)}
              className="px-4 h-9 rounded-full border border-[#171917] text-[#171917] hover:bg-[#eef5ef] text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Feedback
            </button>
            <button
              type="button"
              onClick={() => navigate(`/room/${room.roomId}/replay`)}
              className="px-4 h-9 rounded-full border border-[#e2e7e1] text-[#566059] hover:text-[#171917] hover:border-[#bfcaba] text-[13px] font-medium transition-colors cursor-pointer"
            >
              Replay
            </button>
          </>
        )}
        {room.status === "scheduled" && !canJoin && (
          <span className="text-[12px] text-[#707870]">
            {isFuture(scheduledDate)
              ? `Starts in ${minutesUntil}m`
              : "Session ended"}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CandidateDashboard() {
  const user = useAuthStore((s) => s.user);
  const loginAction = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [activeNav, setActiveNav] = useState("overview"); // "overview" | "interviews" | "evaluation" | "ai-mock" | "notes"
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "upcoming" | "past"
  const [inviteInput, setInviteInput] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");
    if (justLoggedIn === "true") {
      toast({
        title: `Welcome back, ${user?.name?.split(" ")[0] || "there"}`,
        description: "Your candidate workspace is ready.",
      });
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
        console.error("Failed to load candidate interviews", error);
        toast({
          title: "Could not load interviews",
          description:
            error.response?.data?.message || "Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingRooms(false);
      }
    };
    if (user) loadRooms();
  }, [user, toast]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleJoinInvite = (e) => {
    e.preventDefault();
    const raw = inviteInput.trim();
    if (!raw) return;
    const match = raw.match(/\/room\/([a-zA-Z0-9-]+)/);
    const roomCode = match ? match[1] : raw;
    navigate(`/room/${roomCode}`);
  };

  const upcoming = rooms.filter(
    (r) => r.status === "scheduled" || r.status === "active"
  );
  const past = rooms.filter(
    (r) => r.status === "completed" || r.status === "cancelled"
  );
  const completedCount = rooms.filter((r) => r.status === "completed").length;

  const visibleRooms =
    activeTab === "upcoming"
      ? upcoming
      : activeTab === "past"
      ? past
      : rooms;

  const profileFields = [
    user?.headline,
    user?.targetRole,
    user?.bio,
    user?.skills?.length > 0,
  ];
  const profileCompleteCount = profileFields.filter(Boolean).length;

  return (
    <div
      className="candidate-workspace min-h-screen bg-[#fafbf9] text-[#171917] flex flex-col"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
      }}
    >
      <style>{`
        .candidate-workspace h1,
        .candidate-workspace h2,
        .candidate-workspace h3,
        .candidate-workspace h4 {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
        }
      `}</style>

      {/* Single Persistent Top Header — Toggle & Logo never jump */}
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
            to="/"
            className="inline-flex items-center gap-[5px] text-[#111111] text-[19px] font-bold tracking-[-0.01em] leading-none"
          >
            InterviewOS
            <span className="inline-block w-[7px] h-[15px] bg-[#00c875]" aria-hidden="true" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="text-[13.5px] font-medium text-[#414740] hover:text-[#008a52] transition-colors bg-transparent border-none cursor-pointer"
          >
            Profile
          </button>
          <div className="h-4 w-[1px] bg-[#e2e7e1]" />
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

      <div className="flex-1 flex min-h-0">
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
              Candidate workspace
            </p>
            <nav className="space-y-1">
              {[
                { id: "overview", label: "Overview", icon: Users },
                { id: "interviews", label: "Interviews", icon: Calendar },
                { id: "evaluation", label: "Evaluation", icon: BarChart3 },
                { id: "ai-mock", label: "AI Interviewer", icon: Sparkles },
                { id: "notes", label: "Notes", icon: FileText, soon: true },
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
          {/* Page Header + Inline Quick Join */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#e2e7e1]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.13em] text-[#657168] mb-2">
                Candidate workspace
              </p>
              <h1
                className="text-[34px] leading-[1.06] font-semibold tracking-[-0.04em] text-[#171917]"
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                }}
              >
                Welcome back, {user?.name?.split(" ")[0] || "there"}.
              </h1>
            </div>

            <form
              onSubmit={handleJoinInvite}
              className="flex items-center gap-2 w-full lg:w-auto"
            >
              <input
                type="text"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                placeholder="Paste room ID or invite link..."
                className="flex-1 lg:w-72 h-10 px-4 rounded-full border border-[#e2e7e1] bg-white text-[13.5px] text-[#171917] placeholder:text-[#828b83] focus:outline-none focus:border-[#008a52]"
              />
              <button
                type="submit"
                disabled={!inviteInput.trim()}
                className="h-10 px-5 rounded-full bg-[#080a09] hover:bg-[#242925] disabled:opacity-40 text-white text-[13px] font-semibold transition-colors shrink-0 cursor-pointer"
              >
                Join →
              </button>
            </form>
          </div>

          {activeNav === "ai-mock" ? (
            <AiInterviewerHub user={user} />
          ) : activeNav === "notes" ? (
            <div className="py-12 max-w-2xl">
              <span className="inline-block px-2.5 py-1 rounded bg-[#eff1ee] text-[#717b73] text-[11px] font-medium mb-4">
                Coming soon
              </span>
              <h2 className="text-[24px] font-semibold text-[#171917] tracking-[-0.02em] mb-2">
                Personal Prep Notes
              </h2>
              <p className="text-[14.5px] text-[#566059] leading-relaxed">
                Keep private notes across your interviews, review follow-up topics, and track areas to practice before your next round.
              </p>
            </div>
          ) : activeNav === "evaluation" ? (
            <div className="py-10 space-y-6">
              <div>
                <h2 className="text-[20px] font-semibold text-[#171917] mb-1">
                  Shared Evaluations &amp; Feedback
                </h2>
                <p className="text-[14px] text-[#566059]">
                  Feedback is visible here once an interviewer shares it after a completed session.
                </p>
              </div>
              {past.filter((r) => r.status === "completed").length > 0 ? (
                <div>
                  {past
                    .filter((r) => r.status === "completed")
                    .map((room) => (
                      <InterviewRow key={room.id} room={room} />
                    ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-[#e2e7e1] bg-white text-[14px] text-[#566059]">
                  No completed interviews yet. Once an interview finishes and the interviewer shares feedback, you can open your rubric breakdown and session replay here.
                </div>
              )}
            </div>
          ) : (
            /* Default Overview & Interviews */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
              {/* Left Main Column */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between gap-4 border-b border-[#e2e7e1] pb-3">
                  <div className="flex items-center gap-6">
                    {[
                      { id: "all", label: `All (${rooms.length})` },
                      { id: "upcoming", label: `Upcoming (${upcoming.length})` },
                      { id: "past", label: `Past (${past.length})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-[13.5px] font-medium pb-3 -mb-[13px] border-b-2 transition-colors bg-transparent cursor-pointer ${
                          activeTab === tab.id
                            ? "border-[#008a52] text-[#171917]"
                            : "border-transparent text-[#707870] hover:text-[#171917]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
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
                ) : visibleRooms.length > 0 ? (
                  <div>
                    {visibleRooms.map((room) => (
                      <InterviewRow key={room.id} room={room} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 border-b border-[#e2e7e1]">
                    <h2 className="text-[18px] font-semibold text-[#171917] mb-1.5">
                      No interviews here yet
                    </h2>
                    <p className="text-[14px] text-[#566059] max-w-md leading-relaxed">
                      When an interviewer invites you to a session, it will appear in this list. If you already have an invite link, paste it in the bar above.
                    </p>
                  </div>
                )}

                {activeNav === "overview" && (
                  <div className="space-y-3 pt-2">
                    <div className="rounded-xl border border-[#e2e7e1] bg-white overflow-hidden">
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#00c875]" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#008a52]">
                              Voice Practice
                            </span>
                          </div>
                          <h3 className="text-[16px] font-semibold text-[#171917] tracking-[-0.01em]">
                            AI Voice Interviewer
                          </h3>
                          <p className="text-[13px] text-[#566059]">
                            Practice spoken technical or behavioral rounds based on your resume.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveNav("ai-mock")}
                          className="inline-flex items-center justify-center gap-1.5 px-5 h-10 rounded-full bg-[#080a09] hover:bg-[#242925] text-white text-[13px] font-semibold shrink-0 cursor-pointer transition-colors"
                        >
                          Start Practice <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#edf1ed] border-t border-[#edf1ed] bg-[#fafbf9] text-[12px]">
                        <div className="px-5 py-3">
                          <span className="text-[#707870] block text-[10.5px] uppercase tracking-wider">
                            Interviewers
                          </span>
                          <span className="font-medium text-[#171917]">
                            Technical · HR Behavioral
                          </span>
                        </div>
                        <div className="px-5 py-3">
                          <span className="text-[#707870] block text-[10.5px] uppercase tracking-wider">
                            Personalization
                          </span>
                          <span className="font-medium text-[#171917]">
                            Resume-aware follow-ups
                          </span>
                        </div>
                        <div className="px-5 py-3">
                          <span className="text-[#707870] block text-[10.5px] uppercase tracking-wider">
                            Evaluation
                          </span>
                          <span className="font-medium text-[#171917]">
                            Scorecard &amp; transcript
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3.5 rounded-xl border border-[#e2e7e1] bg-white flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[13.5px] font-medium text-[#171917]">
                          Prep Notes
                        </span>
                        <span className="text-[12.5px] text-[#707870] truncate hidden sm:inline">
                          Private notes and follow-up checklists across rounds
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-[10.5px] font-medium rounded bg-[#eff1ee] text-[#717b73] shrink-0">
                        Coming soon
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side Rail: Profile & Summary */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="grid grid-cols-3 border border-[#e2e7e1] rounded-xl bg-white divide-x divide-[#e2e7e1]">
                  <div className="p-4">
                    <div className="text-[11px] uppercase tracking-wider text-[#707870]">
                      Upcoming
                    </div>
                    <div className="text-[22px] font-semibold text-[#171917] mt-0.5 tabular-nums">
                      {upcoming.length}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-[11px] uppercase tracking-wider text-[#707870]">
                      Completed
                    </div>
                    <div className="text-[22px] font-semibold text-[#171917] mt-0.5 tabular-nums">
                      {completedCount}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-[11px] uppercase tracking-wider text-[#707870]">
                      Profile
                    </div>
                    <div className="text-[22px] font-semibold text-[#008a52] mt-0.5 tabular-nums">
                      {Math.round((profileCompleteCount / 4) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-[#e2e7e1] bg-white space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-[16px] font-semibold text-[#171917]">
                        {user?.name}
                      </h2>
                      <p className="text-[13px] text-[#566059]">
                        {user?.headline || user?.targetRole || "No headline set"}
                      </p>
                    </div>
                    <span className="text-[11px] uppercase tracking-wider text-[#707870] border border-[#e2e7e1] px-2 py-0.5 rounded capitalize">
                      {user?.experienceLevel || "mid"}
                    </span>
                  </div>

                  {user?.bio ? (
                    <p className="text-[13px] text-[#566059] leading-relaxed">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="text-[13px] text-[#828b83]">
                      Add a bio, target role, and skills to complete your candidate profile.
                    </p>
                  )}

                  {user?.skills && user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {user.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded bg-[#eef5ef] text-[#008a52] text-[12px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {(user?.githubUrl || user?.linkedinUrl || user?.portfolioUrl) && (
                    <div className="flex flex-wrap gap-3 pt-1 text-[12.5px] text-[#414740]">
                      {user.githubUrl && (
                        <a
                          href={user.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#008a52] inline-flex items-center gap-1"
                        >
                          GitHub <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {user.linkedinUrl && (
                        <a
                          href={user.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#008a52] inline-flex items-center gap-1"
                        >
                          LinkedIn <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {user.portfolioUrl && (
                        <a
                          href={user.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#008a52] inline-flex items-center gap-1"
                        >
                          Portfolio <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#e2e7e1]">
                    <button
                      type="button"
                      onClick={() => setShowProfileModal(true)}
                      className="w-full h-9 rounded-full border border-[#171917] text-[#171917] hover:bg-[#eef5ef] text-[13px] font-semibold transition-colors cursor-pointer bg-transparent"
                    >
                      Edit Profile &amp; Skills
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-[#e2e7e1] bg-white space-y-2.5">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#707870]">
                    Setup checklist
                  </p>
                  {[
                    { label: "Account created", done: true },
                    { label: "Role & skills added", done: Boolean(user?.skills?.length) },
                    { label: "First interview joined", done: rooms.length > 0 },
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

      <AnimatePresence>
        {showProfileModal && (
          <CandidateProfileModal
            user={user}
            onClose={() => setShowProfileModal(false)}
            onSaved={(updatedUser) => {
              const token = localStorage.getItem("accessToken");
              loginAction(updatedUser, token);
              setShowProfileModal(false);
              toast({
                title: "Profile updated",
                description: "Your candidate profile and skills are saved.",
              });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CandidateProfileModal({ user, onClose, onSaved }) {
  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [targetRole, setTargetRole] = useState(user?.targetRole || "");
  const [experienceLevel, setExperienceLevel] = useState(
    user?.experienceLevel || "mid"
  );
  const [bio, setBio] = useState(user?.bio || "");
  const [skillsText, setSkillsText] = useState((user?.skills || []).join(", "));
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 25);
      const res = await api.patch("/users/profile", {
        name: name.trim(),
        headline: headline.trim(),
        targetRole: targetRole.trim(),
        experienceLevel,
        bio: bio.trim(),
        skills,
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
      });
      onSaved(res.data.data);
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

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
        className="w-full max-w-2xl rounded-2xl bg-white border border-[#e2e7e1] p-6 max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-[#171917]">
            Edit Candidate Profile
          </h2>
          <button
            onClick={onClose}
            className="text-[#707870] hover:text-[#171917] bg-transparent border-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 bg-[#fafbf9] border-[#e2e7e1]"
              />
            </div>
            <div>
              <Label>Headline</Label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Full-Stack / AI Engineer"
                className="mt-1 bg-[#fafbf9] border-[#e2e7e1]"
              />
            </div>
            <div>
              <Label>Target Role</Label>
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Applied AI Engineer"
                className="mt-1 bg-[#fafbf9] border-[#e2e7e1]"
              />
            </div>
            <div>
              <Label>Experience Level</Label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-md border border-[#e2e7e1] bg-[#fafbf9] text-sm"
              >
                <option value="student">Student / Intern</option>
                <option value="junior">Junior (0–2 yrs)</option>
                <option value="mid">Mid-Level (2–5 yrs)</option>
                <option value="senior">Senior (5+ yrs)</option>
                <option value="staff">Staff / Principal</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Skills (comma-separated)</Label>
            <Input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Python, React, Node.js, LLMs, MongoDB"
              className="mt-1 bg-[#fafbf9] border-[#e2e7e1]"
            />
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of your engineering background..."
              className="mt-1 bg-[#fafbf9] border-[#e2e7e1] min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>GitHub URL</Label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="mt-1 bg-[#fafbf9] border-[#e2e7e1]"
              />
            </div>
            <div>
              <Label>LinkedIn URL</Label>
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="mt-1 bg-[#fafbf9] border-[#e2e7e1]"
              />
            </div>
            <div>
              <Label>Portfolio URL</Label>
              <Input
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 bg-[#fafbf9] border-[#e2e7e1]"
              />
            </div>
          </div>

          {err && <p className="text-xs text-[#ba1a1a] font-medium">{err}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-[#e2e7e1]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-10 rounded-full border border-[#e2e7e1] text-[13px] font-medium text-[#171917] hover:bg-[#f4f6f3] cursor-pointer bg-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 h-10 rounded-full bg-[#080a09] hover:bg-[#242925] disabled:opacity-50 text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
