import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, isPast, isFuture, differenceInMinutes } from 'date-fns';
import { Calendar, Clock, ArrowRight, Video, Code2, MessageSquare, History, User, LogOut, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { mockRooms } from '@/data/mockData';
import type { InterviewRoom, RoomStatus } from '@/types';

const statusConfig: Record<RoomStatus, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'bg-info/10 text-info border-info/20' },
  active: { label: 'Live', className: 'bg-success/10 text-success border-success/20' },
  completed: { label: 'Completed', className: 'bg-muted text-muted-foreground border-border' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

function RoomCard({ room }: { room: InterviewRoom }) {
  const navigate = useNavigate();
  const scheduledDate = new Date(room.scheduledAt);
  const minutesUntil = differenceInMinutes(scheduledDate, new Date());
  const canJoin = minutesUntil <= 10 && minutesUntil >= -room.durationMinutes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl bg-card border border-border hover:border-primary/20 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{room.title}</h3>
          {room.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{room.description}</p>}
        </div>
        <Badge variant="outline" className={statusConfig[room.status].className}>
          {statusConfig[room.status].label}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(scheduledDate, 'MMM d, yyyy')}</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{format(scheduledDate, 'h:mm a')}</span>
        <span>{room.durationMinutes}min</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {room.techStack.map((t) => (
          <span key={t} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-primary/10 text-primary">{t}</span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {canJoin && room.status !== 'completed' && (
          <Button size="sm" onClick={() => navigate(`/room/${room.roomId}`)} className="bg-gradient-primary hover:opacity-90">
            Join Now <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Button>
        )}
        {room.status === 'completed' && (
          <Button size="sm" variant="outline" onClick={() => navigate(`/feedback/${room.roomId}`)}>
            View Feedback
          </Button>
        )}
        {room.status === 'scheduled' && !canJoin && (
          <span className="text-xs text-muted-foreground">
            {isFuture(scheduledDate) ? `Starts in ${minutesUntil}min` : 'Session ended'}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function CandidateDashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const upcoming = mockRooms.filter((r) => r.status === 'scheduled' && isFuture(new Date(r.scheduledAt)));
  const past = mockRooms.filter((r) => r.status === 'completed');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Welcome back, {user?.name}. Here are your interviews.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Calendar, label: 'Upcoming', value: upcoming.length, color: 'text-info' },
            { icon: Video, label: 'Completed', value: past.length, color: 'text-success' },
            { icon: Code2, label: 'Code Sessions', value: past.length, color: 'text-primary' },
            { icon: MessageSquare, label: 'Feedback', value: past.length, color: 'text-warning' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-card border border-border">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-display font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming */}
        <div className="mb-10">
          <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Upcoming Interviews
          </h2>
          {upcoming.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {upcoming.map((room) => <RoomCard key={room.id} room={room} />)}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl border border-dashed border-border text-muted-foreground">
              No upcoming interviews scheduled.
            </div>
          )}
        </div>

        {/* Past */}
        <div>
          <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" /> Past Interviews
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {past.map((room) => <RoomCard key={room.id} room={room} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
