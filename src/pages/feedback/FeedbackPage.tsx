import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { mockFeedback } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import type { Recommendation } from '@/types';

const recommendations: { value: Recommendation; label: string; color: string }[] = [
  { value: 'strong_yes', label: 'Strong Yes', color: 'bg-success/10 text-success border-success/20' },
  { value: 'yes', label: 'Yes', color: 'bg-info/10 text-info border-info/20' },
  { value: 'no', label: 'No', color: 'bg-warning/10 text-warning border-warning/20' },
  { value: 'strong_no', label: 'Strong No', color: 'bg-destructive/10 text-destructive border-destructive/20' },
];

function RatingBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-32 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-primary"
        />
      </div>
      <span className="text-sm font-display font-semibold w-8 text-right">{value}/{max}</span>
    </div>
  );
}

export default function FeedbackPage() {
  const { roomId } = useParams();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isInterviewer = user?.role === 'interviewer';

  // For interviewer: show form. For candidate: show read-only feedback.
  const [ratings, setRatings] = useState(mockFeedback.ratings);
  const [recommendation, setRecommendation] = useState<Recommendation>(mockFeedback.recommendation);
  const [strengths, setStrengths] = useState(mockFeedback.strengths);
  const [improvements, setImprovements] = useState(mockFeedback.improvements);
  const [notes, setNotes] = useState(mockFeedback.overallNotes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Feedback submitted!', description: 'The candidate will be notified.' });
    navigate(-1);
  };

  const avgRating = Object.values(ratings).reduce((a, b) => a + b, 0) / 4;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-primary">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm">InterviewOS</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-3xl py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">
            {isInterviewer ? 'Submit Feedback' : 'Interview Feedback'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isInterviewer ? "Rate the candidate\u2019s performance and provide constructive feedback." : "Here\u2019s the feedback from your interview."}
          </p>
        </motion.div>

        {/* Score Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-card border border-border mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-primary-foreground">{avgRating.toFixed(1)}</span>
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Overall Score</h3>
              <div className="flex items-center gap-1 mt-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-warning fill-warning' : 'text-muted'}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <RatingBar label="Problem Solving" value={ratings.problemSolving} />
            <RatingBar label="Code Quality" value={ratings.codeQuality} />
            <RatingBar label="Communication" value={ratings.communication} />
            <RatingBar label="Efficiency" value={ratings.efficiency} />
          </div>
        </motion.div>

        {isInterviewer ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sliders */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-5">
              <h3 className="font-display font-semibold">Adjust Ratings</h3>
              {([
                ['problemSolving', 'Problem Solving'],
                ['codeQuality', 'Code Quality'],
                ['communication', 'Communication'],
                ['efficiency', 'Efficiency'],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <Label className="text-sm">{label}</Label>
                    <span className="text-sm font-display font-semibold text-primary">{ratings[key]}/5</span>
                  </div>
                  <Slider
                    value={[ratings[key]]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={([v]) => setRatings((prev) => ({ ...prev, [key]: v }))}
                    className="[&_[role=slider]]:bg-primary"
                  />
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-display font-semibold mb-4">Recommendation</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {recommendations.map((rec) => (
                  <button
                    key={rec.value}
                    type="button"
                    onClick={() => setRecommendation(rec.value)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      recommendation === rec.value ? rec.color + ' border-current' : 'border-border bg-secondary text-muted-foreground'
                    }`}
                  >
                    {rec.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Feedback */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div>
                <Label>Strengths</Label>
                <Textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} className="mt-1.5 bg-secondary border-border min-h-[80px]" />
              </div>
              <div>
                <Label>Areas for Improvement</Label>
                <Textarea value={improvements} onChange={(e) => setImprovements(e.target.value)} className="mt-1.5 bg-secondary border-border min-h-[80px]" />
              </div>
              <div>
                <Label>Overall Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5 bg-secondary border-border min-h-[80px]" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90">Submit Feedback</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-display font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" /> Strengths
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{strengths}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-display font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" /> Areas for Improvement
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{improvements}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-display font-semibold mb-2">Overall Notes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{notes}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="p-4 rounded-xl border border-border flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Recommendation:</span>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${recommendations.find((r) => r.value === recommendation)?.color}`}>
                {recommendations.find((r) => r.value === recommendation)?.label}
              </span>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
