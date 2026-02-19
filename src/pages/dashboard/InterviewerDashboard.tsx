import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Calendar, Clock, Users, Copy, ArrowRight, BarChart3, CheckCircle2, User, LogOut, Terminal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { mockRooms } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import type { RoomStatus } from '@/types';

const statusConfig: Record<RoomStatus, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-info/10 text-info border-info/20' },
  active: { label: 'Live', className: 'bg-success/10 text-success border-success/20' },
  completed: { label: 'Completed', className: 'bg-muted text-muted-foreground border-border' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function InterviewerDashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all');
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filtered = filter === 'all' ? mockRooms : mockRooms.filter((r) => r.status === filter);
  const completedCount = mockRooms.filter((r) => r.status === 'completed').length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const copyInvite = (roomId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${roomId}`);
    toast({ title: 'Invite link copied!' });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary">
              <Terminal className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">InterviewOS</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-display font-bold mb-1">Interviewer Dashboard</h1>
            <p className="text-muted-foreground">Manage your interviews and candidates.</p>
          </motion.div>
          <Button onClick={() => setShowCreate(true)} className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" /> Create Room
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Calendar, label: 'Total Interviews', value: mockRooms.length },
            { icon: CheckCircle2, label: 'Completed', value: completedCount },
            { icon: Users, label: 'Candidates', value: 3 },
            { icon: BarChart3, label: 'Avg Rating', value: '4.2' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-card border border-border">
              <stat.icon className="w-5 h-5 text-primary mb-2" />
              <div className="text-2xl font-display font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'scheduled', 'active', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Room List */}
        <div className="space-y-3">
          {filtered.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card border border-border hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display font-semibold">{room.title}</h3>
                    <Badge variant="outline" className={statusConfig[room.status].className}>
                      {statusConfig[room.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(room.scheduledAt), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{format(new Date(room.scheduledAt), 'h:mm a')}</span>
                    <span>{room.durationMinutes}min</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{room.candidateEmail}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {room.techStack.map((t) => (
                      <span key={t} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-primary/10 text-primary">{t}</span>
                    ))}
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md ${
                      room.difficultyLevel === 'hard' ? 'bg-destructive/10 text-destructive' :
                      room.difficultyLevel === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>
                      {room.difficultyLevel}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => copyInvite(room.roomId)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  {room.status === 'scheduled' && (
                    <Button size="sm" onClick={() => navigate(`/room/${room.roomId}`)} className="bg-gradient-primary hover:opacity-90">
                      Start <ArrowRight className="ml-1 w-3.5 h-3.5" />
                    </Button>
                  )}
                  {room.status === 'completed' && (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/feedback/${room.roomId}`)}>
                      Feedback
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl bg-card border border-border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold">Create Interview Room</h2>
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowCreate(false); toast({ title: 'Room created!', description: 'Invite link has been sent to the candidate.' }); }}>
                <div>
                  <Label>Title</Label>
                  <Input placeholder="Frontend Engineer — React Assessment" className="mt-1.5 bg-secondary border-border" required />
                </div>
                <div>
                  <Label>Candidate Email</Label>
                  <Input type="email" placeholder="candidate@example.com" className="mt-1.5 bg-secondary border-border" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date & Time</Label>
                    <Input type="datetime-local" className="mt-1.5 bg-secondary border-border" required />
                  </div>
                  <div>
                    <Label>Duration (min)</Label>
                    <Select defaultValue="60">
                      <SelectTrigger className="mt-1.5 bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                        <SelectItem value="90">90 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Tech Stack</Label>
                  <Input placeholder="React, TypeScript, Node.js" className="mt-1.5 bg-secondary border-border" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Difficulty</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div />
                </div>
                <div>
                  <Label>Problem Statement</Label>
                  <Textarea placeholder="Describe the coding problem..." className="mt-1.5 bg-secondary border-border min-h-[80px]" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90">Create Room</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
