import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Calendar, Clock, Users, Copy, ArrowRight, BarChart3, CheckCircle2, User, LogOut, Terminal, X, AlertCircle, CreditCard } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { createRoomSchema } from '@/lib/validations';
const getSessionStorageKey = (roomId) => `interviewos:room-session:${roomId}`;
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
    const interviewer = normalizeUser(room.interviewer, 'interviewer') || currentUser || {
        id: '',
        name: 'Interviewer',
        email: '',
        role: 'interviewer',
        avatar: '',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
    };
    const candidate = normalizeUser(room.candidate, 'candidate');
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
export default function InterviewerDashboard() {
    const [showCreate, setShowCreate] = useState(false);
    const [filter, setFilter] = useState('all');
    const [rooms, setRooms] = useState([]);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [startingRoomId, setStartingRoomId] = useState(null);
    const [showProfileTip, setShowProfileTip] = useState(false);
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const navigate = useNavigate();
    const { toast } = useToast();
    const filtered = filter === 'all' ? rooms : rooms.filter((r) => r.status === filter);
    const completedCount = rooms.filter((r) => r.status === 'completed').length;
    const candidateCount = new Set(rooms.map((room) => room.candidateEmail).filter(Boolean)).size;

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
                toast({
                    title: 'Failed to load rooms',
                    description: error?.response?.data?.message || 'Unable to fetch interview rooms right now.',
                    variant: 'destructive',
                });
            }
            finally {
                setIsLoadingRooms(false);
            }
        };
        loadRooms();
    }, [toast, user]);
    const handleCreateRoom = async (data) => {
        if (!user) {
            toast({
                title: 'Unable to create room',
                description: 'Please sign in again and retry.',
                variant: 'destructive',
            });
            return;
        }
        try {
            const response = await api.post('/rooms', {
                title: data.title.trim(),
                description: data.problemStatement.trim(),
                candidateEmail: data.candidateEmail.trim(),
                scheduledAt: new Date(data.dateTime).toISOString(),
                durationMinutes: Number(data.duration),
                problemStatement: data.problemStatement.trim(),
                techStack: data.techStack
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                difficultyLevel: data.difficulty,
            });
            const createdRoom = mapApiRoomToRoom(response.data.data, user, data.candidateEmail.trim());
            setRooms((prev) => [createdRoom, ...prev]);
            setShowCreate(false);
            toast({
                title: 'Room created!',
                description: 'The interview room is now available in your list.',
            });
        }
        catch (error) {
            toast({
                title: 'Unable to create room',
                description: error?.response?.data?.message || 'Please try again.',
                variant: 'destructive',
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
            setRooms((prev) => prev.map((item) => (item.id === room.id ? { ...item, status: 'active' } : item)));
            navigate(`/room/${room.roomId}`);
        }
        catch (error) {
            toast({
                title: 'Unable to start room',
                description: error?.response?.data?.message || 'Please try again.',
                variant: 'destructive',
            });
        }
        finally {
            setStartingRoomId(null);
        }
    };
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    const copyInvite = (roomId) => {
        navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
        toast({ title: 'Invite link copied!' });
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold mb-1">Interviewer Dashboard</h1>
              <p className="text-muted-foreground">Manage your interviews and candidates.</p>
            </motion.div>
            <Button onClick={() => setShowCreate(true)} className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto active:scale-95 transition-all">
              <Plus className="w-4 h-4 mr-2"/> Create Room
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {[
              { icon: Calendar, label: 'Total Interviews', value: rooms.length },
              { icon: CheckCircle2, label: 'Completed', value: completedCount },
              { icon: Users, label: 'Candidates', value: candidateCount },
              { icon: BarChart3, label: 'Avg Rating', value: '4.2' },
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

          {/* Filters */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['all', 'scheduled', 'active', 'completed', 'cancelled'].map((status) => (<button key={status} onClick={() => setFilter(status)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all active:scale-95 ${filter === status
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>))}
          </div>

          {/* Room List */}
          <div className="space-y-4">
            {!isLoadingRooms && rooms.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 max-w-2xl mx-auto my-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Interviews Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                  You have not created or scheduled any interviews yet. Get started by scheduling your first technical assessment room.
                </p>
                <Button onClick={() => setShowCreate(true)} className="bg-gradient-primary hover:opacity-90 active:scale-95 transition-all">
                  <Plus className="w-4 h-4 mr-2"/> Create Interview Room
                </Button>
              </div>
            )}
            {!isLoadingRooms && rooms.length > 0 && filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
                No interviews match the selected filter.
              </div>
            )}
            {filtered.map((room, i) => (
              <motion.div 
                key={room.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }} 
                className="rounded-xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all hover:shadow-md group"
              >
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
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{room.title}</h3>
                        <Badge variant="outline" className={statusConfig[room.status].className}>
                          {statusConfig[room.status].label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/>{format(new Date(room.scheduledAt), 'MMM d, yyyy')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/>{format(new Date(room.scheduledAt), 'h:mm a')}</span>
                        <span>{room.durationMinutes}min</span>
                        <span className="flex items-center gap-1 break-all"><Users className="w-3.5 h-3.5 shrink-0"/>{room.candidateEmail}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {room.techStack.map((t) => (<span key={t} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-primary/10 text-primary">{t}</span>))}
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md ${room.difficultyLevel === 'hard' ? 'bg-destructive/10 text-destructive' :
                  room.difficultyLevel === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                          {room.difficultyLevel}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:ml-4 self-center">
                      <Button size="sm" variant="outline" className="active:scale-95 transition-all" onClick={() => copyInvite(room.roomId)}>
                        <Copy className="w-3.5 h-3.5"/>
                      </Button>
                      {room.status === 'scheduled' && (<Button size="sm" onClick={() => handleStartRoom(room)} className="bg-gradient-primary hover:opacity-90 active:scale-95 transition-all" disabled={startingRoomId === room.id}>
                          {startingRoomId === room.id ? 'Starting...' : 'Start'} <ArrowRight className="ml-1 w-3.5 h-3.5"/>
                        </Button>)}
                      {room.status === 'completed' && (<Button size="sm" variant="outline" className="active:scale-95 transition-all" onClick={() => navigate(`/feedback/${room.roomId}`)}>
                          Feedback
                        </Button>)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Status Indicator */}
        <div className="fixed bottom-4 right-4 z-40 bg-background/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="font-mono text-[10px] text-muted-foreground">InterviewOS Core v4.2 Online</span>
        </div>

        {/* Create Room Modal */}
        <AnimatePresence>
          {showCreate && (<CreateRoomModal onClose={() => setShowCreate(false)} onCreateRoom={handleCreateRoom}/>)}
        </AnimatePresence>
      </div>);
}
/* ─── Create Room Modal Component ─── */
function CreateRoomModal({ onClose, onCreateRoom }) {
    const { register, handleSubmit, control, formState: { errors }, } = useForm({
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
    const FieldError = ({ message }) => message ? (<motion.p initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] mt-1 flex items-center gap-1 text-destructive" role="alert">
          <AlertCircle className="w-3 h-3"/> {message}
        </motion.p>) : null;
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl rounded-xl bg-card border border-border p-6 max-h-[95vh] md:max-h-none overflow-y-auto md:overflow-visible shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold">Create Interview Room</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5"/>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Basic Details */}
              <div className="space-y-4">
                <div>
                  <Label>Title <span className="text-destructive">*</span></Label>
                  <Input placeholder="Frontend Engineer — React Assessment" className={`mt-1.5 bg-secondary border-border ${errors.title ? "!border-destructive" : ""}`} {...register("title")}/>
                  <FieldError message={errors.title?.message}/>
                </div>
                <div>
                  <Label>Candidate Email <span className="text-destructive">*</span></Label>
                  <Input type="email" placeholder="candidate@example.com" className={`mt-1.5 bg-secondary border-border ${errors.candidateEmail ? "!border-destructive" : ""}`} {...register("candidateEmail")}/>
                  <FieldError message={errors.candidateEmail?.message}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date & Time <span className="text-destructive">*</span></Label>
                    <Input type="datetime-local" className={`mt-1.5 bg-secondary border-border ${errors.dateTime ? "!border-destructive" : ""}`} {...register("dateTime")}/>
                    <FieldError message={errors.dateTime?.message}/>
                  </div>
                  <div>
                    <Label>Duration (min) <span className="text-destructive">*</span></Label>
                    <Controller name="duration" control={control} render={({ field }) => (<Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={`mt-1.5 bg-secondary border-border ${errors.duration ? "!border-destructive" : ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 min</SelectItem>
                            <SelectItem value="45">45 min</SelectItem>
                            <SelectItem value="60">60 min</SelectItem>
                            <SelectItem value="90">90 min</SelectItem>
                          </SelectContent>
                        </Select>)}/>
                    <FieldError message={errors.duration?.message}/>
                  </div>
                </div>
              </div>

              {/* Right Column: Assessment Details */}
              <div className="space-y-4">
                <div>
                  <Label>Tech Stack <span className="text-destructive">*</span></Label>
                  <Input placeholder="React, TypeScript, Node.js" className={`mt-1.5 bg-secondary border-border ${errors.techStack ? "!border-destructive" : ""}`} {...register("techStack")}/>
                  <FieldError message={errors.techStack?.message}/>
                </div>
                <div>
                  <Label>Difficulty <span className="text-destructive">*</span></Label>
                  <Controller name="difficulty" control={control} render={({ field }) => (<Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={`mt-1.5 bg-secondary border-border ${errors.difficulty ? "!border-destructive" : ""}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>)}/>
                  <FieldError message={errors.difficulty?.message}/>
                </div>
                <div>
                  <Label>Problem Statement <span className="text-destructive">*</span></Label>
                  <Textarea placeholder="Describe the coding problem (min 10 characters)..." className={`mt-1.5 bg-secondary border-border min-h-[92px] ${errors.problemStatement ? "!border-destructive" : ""}`} {...register("problemStatement")}/>
                  <FieldError message={errors.problemStatement?.message}/>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
              <Button type="button" variant="outline" onClick={onClose} className="px-6">Cancel</Button>
              <Button type="submit" className="px-8 bg-gradient-primary hover:opacity-90">Create Room</Button>
            </div>
          </form>
        </motion.div>
      </motion.div>);
}
