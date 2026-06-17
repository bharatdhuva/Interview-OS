import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Terminal, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { feedbackSchema } from '@/lib/validations';
const recommendations = [
    { value: 'strong_yes', label: 'Strong Yes', color: 'bg-success/10 text-success border-success/20' },
    { value: 'yes', label: 'Yes', color: 'bg-info/10 text-info border-info/20' },
    { value: 'no', label: 'No', color: 'bg-warning/10 text-warning border-warning/20' },
    { value: 'strong_no', label: 'Strong No', color: 'bg-destructive/10 text-destructive border-destructive/20' },
];

const defaultRatings = { problemSolving: 3, codeQuality: 3, communication: 3, efficiency: 3 };

function RatingBar({ label, value, max = 5 }) {
    return (<div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-32 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-primary"/>
      </div>
      <span className="text-sm font-display font-semibold w-8 text-right">{value}/{max}</span>
    </div>);
}
export default function FeedbackPage() {
    const { roomId } = useParams();
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const { toast } = useToast();
    const isInterviewer = user?.role === 'interviewer';

    // Room metadata (resolved from API)
    const [roomData, setRoomData] = useState(null);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingFeedback, setExistingFeedback] = useState(null);

    // Form state — for interviewer submission
    const [ratings, setRatings] = useState(defaultRatings);
    const [recommendation, setRecommendation] = useState('');
    const [strengths, setStrengths] = useState('');
    const [improvements, setImprovements] = useState('');
    const [notes, setNotes] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Fetch room details + existing feedback on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                // 1. Fetch room details to get MongoDB _id
                const roomRes = await api.get(`/rooms/${roomId}`);
                const room = roomRes.data.data;
                setRoomData(room);

                // 2. Try to fetch existing feedback for this room
                try {
                    const fbRes = await api.get(`/feedback/${room._id}`);
                    const fb = fbRes.data.data;
                    if (fb) {
                        setExistingFeedback(fb);
                        // Pre-fill form with existing feedback (useful for viewing)
                        if (fb.ratings) setRatings(fb.ratings);
                        if (fb.recommendation) setRecommendation(fb.recommendation);
                        if (fb.strengths) setStrengths(fb.strengths);
                        if (fb.improvements) setImprovements(fb.improvements);
                        if (fb.overallNotes) setNotes(fb.overallNotes);
                    }
                } catch (fbErr) {
                    // 404 = no feedback yet (expected for new submissions), 403 = not shared yet
                    if (fbErr.response?.status === 403) {
                        toast({
                            title: 'Feedback not available yet',
                            description: 'The interviewer has not shared the feedback with you.',
                            variant: 'destructive',
                        });
                        navigate(-1);
                        return;
                    }
                    // 404 is fine — interviewer is submitting new feedback
                }
            } catch (error) {
                console.error('Failed to load feedback page data', error);
                toast({
                    title: 'Error loading data',
                    description: 'Could not load room details. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [roomId, navigate, toast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate using Zod schema
        const result = feedbackSchema.safeParse({
            ratings,
            recommendation: recommendation || undefined,
            strengths,
            improvements,
            notes,
        });
        if (!result.success) {
            const errs = {};
            for (const issue of result.error.issues) {
                const key = issue.path.join(".");
                if (!errs[key])
                    errs[key] = issue.message;
            }
            setFieldErrors(errs);
            return;
        }
        setFieldErrors({});

        // Submit to backend API
        try {
            setIsSubmitting(true);

            // Find the latest session for this room
            // The backend will resolve the session if we provide the room _id
            // We need to get the sessionId — fetch from room sessions or use the last one
            let sessionId = roomData?.latestSessionId;

            // If no sessionId cached, try to find it from the session endpoint
            if (!sessionId) {
                try {
                    // The room object may have session info after endSession was called
                    // Try to get it from the rooms endpoint which returns session data
                    const roomRes = await api.get(`/rooms/${roomId}`);
                    const roomDoc = roomRes.data.data;
                    // The startSession/endSession handlers create InterviewSession docs linked to room._id
                    // We'll pass the room _id and let backend use the latest session
                    sessionId = roomDoc._id; // Fallback: use room _id, backend resolves session
                } catch {
                    sessionId = roomData?._id;
                }
            }

            await api.post('/feedback', {
                roomId: roomData._id,
                sessionId: sessionId || roomData._id,
                ratings,
                strengths,
                improvements,
                overallNotes: notes,
                recommendation,
            });

            toast({ title: 'Feedback submitted!', description: 'The candidate will be notified.' });
            navigate(-1);
        } catch (error) {
            console.error('Failed to submit feedback', error);
            toast({
                title: 'Submission failed',
                description: error.response?.data?.message || 'Could not submit feedback. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading feedback...</p>
                </div>
            </div>
        );
    }

    // For candidates: if feedback is loaded, show read-only. If not, show a message.
    const showReadOnly = !isInterviewer || existingFeedback;
    const displayRatings = existingFeedback?.ratings || ratings;
    const displayStrengths = existingFeedback?.strengths || strengths;
    const displayImprovements = existingFeedback?.improvements || improvements;
    const displayNotes = existingFeedback?.overallNotes || notes;
    const displayRecommendation = existingFeedback?.recommendation || recommendation;

    const avgRating = Object.values(displayRatings).reduce((a, b) => a + b, 0) / 4;

    return (<div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1"/> Back
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-primary">
              <Terminal className="w-3.5 h-3.5 text-primary-foreground"/>
            </div>
            <span className="font-display font-bold text-sm">InterviewOS</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-3xl py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">
            {isInterviewer && !existingFeedback ? 'Submit Feedback' : 'Interview Feedback'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isInterviewer && !existingFeedback
              ? "Rate the candidate\u2019s performance and provide constructive feedback."
              : "Here\u2019s the feedback from your interview."}
          </p>
        </motion.div>

        {/* Score Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-xl bg-card border border-border mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-primary-foreground">{avgRating.toFixed(1)}</span>
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Overall Score</h3>
              <div className="flex items-center gap-1 mt-0.5">
                {[1, 2, 3, 4, 5].map((s) => (<Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-warning fill-warning' : 'text-muted'}`}/>))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <RatingBar label="Problem Solving" value={displayRatings.problemSolving}/>
            <RatingBar label="Code Quality" value={displayRatings.codeQuality}/>
            <RatingBar label="Communication" value={displayRatings.communication}/>
            <RatingBar label="Efficiency" value={displayRatings.efficiency}/>
          </div>
        </motion.div>

        {isInterviewer && !existingFeedback ? (<form onSubmit={handleSubmit} className="space-y-6">
            {/* Sliders */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-5">
              <h3 className="font-display font-semibold">Adjust Ratings</h3>
              {[
                ['problemSolving', 'Problem Solving'],
                ['codeQuality', 'Code Quality'],
                ['communication', 'Communication'],
                ['efficiency', 'Efficiency'],
            ].map(([key, label]) => (<div key={key}>
                  <div className="flex justify-between mb-2">
                    <Label className="text-sm">{label}</Label>
                    <span className="text-sm font-display font-semibold text-primary">{ratings[key]}/5</span>
                  </div>
                  <Slider value={[ratings[key]]} min={1} max={5} step={1} onValueChange={([v]) => setRatings((prev) => ({ ...prev, [key]: v }))} className="[&_[role=slider]]:bg-primary"/>
                </div>))}
            </div>

            {/* Recommendation */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-display font-semibold mb-4">Recommendation <span className="text-destructive">*</span></h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {recommendations.map((rec) => (<button key={rec.value} type="button" onClick={() => { setRecommendation(rec.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.recommendation; return next; }); }} className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${recommendation === rec.value ? rec.color + ' border-current' : 'border-border bg-secondary text-muted-foreground'}`}>
                    {rec.label}
                  </button>))}
              </div>
              {fieldErrors.recommendation && (<motion.p initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] mt-2 text-destructive flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3"/> {fieldErrors.recommendation}
                </motion.p>)}
            </div>

            {/* Text Feedback */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <Label>Strengths <span className="text-destructive">*</span></Label>
                  <span className={`text-[10px] ${strengths.length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>{strengths.length}/1000</span>
                </div>
                <Textarea value={strengths} onChange={(e) => { setStrengths(e.target.value); if (fieldErrors.strengths)
            setFieldErrors((prev) => { const next = { ...prev }; delete next.strengths; return next; }); }} className={`mt-1.5 bg-secondary border-border min-h-[80px] ${fieldErrors.strengths ? '!border-destructive' : ''}`} placeholder="What did the candidate do well? (min 10 characters)"/>
                {fieldErrors.strengths && (<motion.p initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] mt-1 text-destructive flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3"/> {fieldErrors.strengths}
                  </motion.p>)}
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Label>Areas for Improvement <span className="text-destructive">*</span></Label>
                  <span className={`text-[10px] ${improvements.length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>{improvements.length}/1000</span>
                </div>
                <Textarea value={improvements} onChange={(e) => { setImprovements(e.target.value); if (fieldErrors.improvements)
            setFieldErrors((prev) => { const next = { ...prev }; delete next.improvements; return next; }); }} className={`mt-1.5 bg-secondary border-border min-h-[80px] ${fieldErrors.improvements ? '!border-destructive' : ''}`} placeholder="What areas need improvement? (min 10 characters)"/>
                {fieldErrors.improvements && (<motion.p initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] mt-1 text-destructive flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3"/> {fieldErrors.improvements}
                  </motion.p>)}
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Label>Overall Notes</Label>
                  <span className={`text-[10px] ${notes.length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>{notes.length}/1000</span>
                </div>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`mt-1.5 bg-secondary border-border min-h-[80px] ${fieldErrors.notes ? '!border-destructive' : ''}`} placeholder="Any additional notes (optional)"/>
                {fieldErrors.notes && (<motion.p initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[11px] mt-1 text-destructive flex items-center gap-1" role="alert">
                    <AlertCircle className="w-3 h-3"/> {fieldErrors.notes}
                  </motion.p>)}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-primary hover:opacity-90">
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Feedback'}
              </Button>
            </div>
          </form>) : (<div className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-display font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success"/> Strengths
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{displayStrengths || 'No strengths noted.'}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-display font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning"/> Areas for Improvement
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{displayImprovements || 'No improvements noted.'}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-display font-semibold mb-2">Overall Notes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{displayNotes || 'No additional notes.'}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="p-4 rounded-xl border border-border flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Recommendation:</span>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${recommendations.find((r) => r.value === displayRecommendation)?.color || 'text-muted-foreground'}`}>
                {recommendations.find((r) => r.value === displayRecommendation)?.label || 'Not set'}
              </span>
            </motion.div>
          </div>)}
      </div>
    </div>);
}
