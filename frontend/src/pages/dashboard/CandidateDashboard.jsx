import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isFuture, differenceInMinutes } from 'date-fns';
import { Calendar, Clock, ArrowRight, Video, Code2, MessageSquare, History, User, LogOut, Terminal, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const normalizeUser = (value, fallbackRole) => {
    if (!value || typeof value === 'string') {
        return undefined;
    }
    return {
        id: value._id || value.id || '',
        name: value.name || '',
        email: value.email || '',
        role: value.role || fallbackRole,
        avatar: value.avatar || '',
        isEmailVerified: value.isEmailVerified ?? true,
        createdAt: value.createdAt || new Date().toISOString(),
    };
};

const mapApiRoomToRoom = (room, currentUser, fallbackCandidateEmail) => {
    const interviewer = normalizeUser(room.interviewer, 'interviewer') || {
        id: '',
        name: 'Interviewer',
        email: '',
        role: 'interviewer',
        avatar: '',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
    };
    const candidate = normalizeUser(room.candidate, 'candidate') || currentUser || {
        id: '',
        name: 'Candidate',
        email: '',
        role: 'candidate',
        avatar: '',
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
        candidateEmail: candidate?.email || room.candidateEmail || fallbackCandidateEmail || '',
        scheduledAt: room.scheduledAt,
        durationMinutes: room.durationMinutes,
        status: room.status,
        problemStatement: room.problemStatement,
        techStack: room.techStack || [],
        difficultyLevel: room.difficultyLevel || 'medium',
        createdAt: room.createdAt || new Date().toISOString(),
    };
};

const statusConfig = {
    scheduled: { label: 'Scheduled', className: 'bg-info/10 text-info border-info/20' },
    active: { label: 'Live', className: 'bg-success/10 text-success border-success/20' },
    completed: { label: 'Completed', className: 'bg-muted text-muted-foreground border-border' },
    cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

function RoomCard({ room }) {
    const navigate = useNavigate();
    const scheduledDate = new Date(room.scheduledAt);
    const minutesUntil = differenceInMinutes(scheduledDate, new Date());
    const canJoin = minutesUntil <= 10 && minutesUntil >= -room.durationMinutes;
    return (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all hover:shadow-md group">
      {/* Simulated Tab Bar / Window Header */}
      <div className="bg-muted/40 px-4 py-2.5 border-b border-border/60 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400/80" />
          <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
          <span className="w-2 h-2 rounded-full bg-green-400/80" />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground tracking-wider group-hover:text-primary transition-colors">
          {room.roomId}.session
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{room.title}</h3>
            {room.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{room.description}</p>}
          </div>
          <Badge variant="outline" className={statusConfig[room.status].className}>
            {statusConfig[room.status].label}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/>{format(scheduledDate, 'MMM d, yyyy')}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>{format(scheduledDate, 'h:mm a')}</span>
          <span>{room.durationMinutes}min</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {room.techStack.map((t) => (<span key={t} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-primary/10 text-primary">{t}</span>))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {room.status === 'active' && (<Button size="sm" onClick={() => navigate(`/room/${room.roomId}`)} className="bg-gradient-primary hover:opacity-90 active:scale-95 transition-all">
              Join Now <ArrowRight className="ml-1 w-3.5 h-3.5"/>
            </Button>)}
          {room.status === 'scheduled' && canJoin && (<Button size="sm" onClick={() => navigate(`/room/${room.roomId}`)} className="bg-gradient-primary hover:opacity-90 active:scale-95 transition-all">
              Join Now <ArrowRight className="ml-1 w-3.5 h-3.5"/>
            </Button>)}
          {room.status === 'completed' && (<Button size="sm" variant="outline" className="active:scale-95 transition-all" onClick={() => navigate(`/feedback/${room.roomId}`)}>
              View Feedback
            </Button>)}
          {room.status === 'scheduled' && !canJoin && (<span className="text-xs text-muted-foreground">
              {isFuture(scheduledDate) ? `Starts in ${minutesUntil}min` : 'Session ended'}
            </span>)}
        </div>
      </div>
    </motion.div>);
}

export default function CandidateDashboard() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();
    const { toast } = useToast();
    const [rooms, setRooms] = useState([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [showProfileTip, setShowProfileTip] = useState(false);

    useEffect(() => {
        const justLoggedIn = sessionStorage.getItem("justLoggedIn");
        if (justLoggedIn === "true") {
            toast({
                title: `Welcome back, ${user?.name?.split(" ")[0] || "there"}! 👋`,
                description: "Great to see you again on InterviewOS.",
            });
            setShowProfileTip(true);
            sessionStorage.removeItem("justLoggedIn");
        }
    }, [user, toast]);

    useEffect(() => {
        const loadRooms = async () => {
            try {
                setIsLoadingRooms(true);
                const response = await api.get('/rooms');
                const nextRooms = (response.data.data || []).map((room) => mapApiRoomToRoom(room, user));
                setRooms(nextRooms);
            }
            catch (error) {
                console.error('Failed to load candidate rooms', error);
            }
            finally {
                setIsLoadingRooms(false);
            }
        };
        loadRooms();
    }, [user]);

    const upcoming = rooms.filter((r) => r.status === 'scheduled' && isFuture(new Date(r.scheduledAt)));
    const past = rooms.filter((r) => r.status === 'completed');
    const completedCount = past.length;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (<div className="dashboard-container min-h-screen bg-background bg-dashboard-dot-pattern pb-12">
        <style dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

            .dashboard-container {
              font-family: 'Montserrat', sans-serif !important;
              --primary: 130 77% 22% !important; /* #0d631b */
              --primary-foreground: 0 0% 100% !important;
              --background: 120 10% 98% !important; /* #f8faf8 */
              --foreground: 160 5% 10% !important; /* #191c1b */
              --card: 0 0% 100% !important; /* #ffffff */
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
              --gradient-primary: linear-gradient(135deg, hsl(130, 77%, 22%), hsl(120, 45%, 34%)) !important;
            }

            .dark .dashboard-container, .dashboard-container.dark {
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
              --gradient-primary: linear-gradient(135deg, hsl(116, 53%, 68%), hsl(128, 17% , 15%)) !important;
            }

            .dashboard-container button,
            .dashboard-container input,
            .dashboard-container select,
            .dashboard-container textarea,
            .dashboard-container span,
            .dashboard-container div,
            .dashboard-container h1,
            .dashboard-container h2,
            .dashboard-container h3,
            .dashboard-container h4,
            .dashboard-container a {
              font-family: 'Montserrat', sans-serif !important;
            }

            .bg-dashboard-dot-pattern {
              background-image: radial-gradient(circle, rgba(13, 99, 27, 0.05) 1px, transparent 1px);
              background-size: 24px 24px;
            }
            .dark .bg-dashboard-dot-pattern, .dashboard-container.dark .bg-dashboard-dot-pattern {
              background-image: radial-gradient(circle, rgba(136, 217, 130, 0.04) 1px, transparent 1px);
              background-size: 24px 24px;
            }
          `
        }} />
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary">
              <Terminal className="w-4 h-4 text-primary-foreground"/>
            </div>
            <span className="font-bold text-primary">InterviewOS</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-85 select-none"
                onClick={() => setShowProfileTip(prev => !prev)}
              >
                <div className="relative w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary"/>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-background animate-pulse" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
              </div>

              <AnimatePresence>
                {showProfileTip && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-11 right-0 z-50 w-64 p-4 rounded-xl bg-card border border-border shadow-xl text-left"
                  >
                    <div className="flex items-center gap-1.5 mb-2.5 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/80" />
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400/80" />
                      <span className="font-mono text-[9px] text-muted-foreground ml-1">profile_helper.sh</span>
                    </div>
                    <p className="text-xs text-foreground font-semibold mb-1">Set up your profile</p>
                    <p className="text-[11px] text-muted-foreground mb-3 leading-normal">
                      Add your details to customize your interview experience.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="ghost" 
                        className="text-[10px] h-7 px-2"
                        onClick={() => setShowProfileTip(false)}
                      >
                        Later
                      </Button>
                      <Button 
                        className="text-[10px] h-7 px-3 bg-gradient-primary hover:opacity-90 text-primary-foreground"
                        onClick={() => {
                          setShowProfileTip(false);
                          navigate("/onboarding");
                        }}
                      >
                        Complete Now
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/pricing')}>
              <CreditCard className="w-4 h-4"/>
              <span className="hidden sm:inline ml-1">Pricing</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4"/>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6 sm:py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Welcome back, {user?.name}. Here are your interviews.</p>
        </motion.div>

        {isLoadingRooms ? (
          <div className="py-20 text-center">
            <span className="text-sm text-muted-foreground">Loading your interviews...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Interviews Scheduled</h3>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              You have not given or taken any interviews yet. When an interviewer invites you to a session, it will show up here.
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
              {[
                { icon: Calendar, label: 'Upcoming', value: upcoming.length },
                { icon: Video, label: 'Completed', value: past.length },
                { icon: Code2, label: 'Code Sessions', value: completedCount },
                { icon: MessageSquare, label: 'Feedback', value: completedCount },
              ].map((stat) => (
                <div key={stat.label} className="relative overflow-hidden p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-md group">
                  <div className="absolute top-0 right-0 p-3 text-primary/10 group-hover:text-primary/20 transition-colors">
                    <stat.icon className="w-12 h-12 stroke-[1]"/>
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{stat.label}</div>
                  <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Upcoming */}
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 select-none">
                <Calendar className="w-5 h-5 text-primary"/> Upcoming Interviews
              </h2>
              {upcoming.length > 0 ? (<div className="grid md:grid-cols-2 gap-4">
                  {upcoming.map((room) => <RoomCard key={room.id} room={room}/>)}
                </div>) : (<div className="p-8 text-center rounded-xl border border-dashed border-border text-muted-foreground">
                  No upcoming interviews scheduled.
                </div>)}
            </div>

            {/* Past */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 select-none">
                <History className="w-5 h-5 text-muted-foreground"/> Past Interviews
              </h2>
              {past.length > 0 ? (<div className="grid md:grid-cols-2 gap-4">
                  {past.map((room) => <RoomCard key={room.id} room={room}/>)}
                </div>) : (<div className="p-8 text-center rounded-xl border border-dashed border-border text-muted-foreground">
                  No past interviews found.
                </div>)}
            </div>
          </>
        )}
      </div>

      {/* System Status Indicator */}
      <div className="fixed bottom-4 right-4 z-40 bg-background/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        <span className="font-mono text-[10px] text-muted-foreground">InterviewOS Core v4.2 Online</span>
      </div>
    </div>);
}
