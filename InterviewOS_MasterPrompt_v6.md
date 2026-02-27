# 🚀 INTERVIEW PLATFORM — MASTER BUILD PROMPT v6
### Production-Grade Resume Project | MERN + WebRTC + AI + Proctoring + Email System
### + Session Replay + AI Interviewer Mode + Question Bank + Interview Timer + Code Playback
### By Bharat Dhuva | MS University Baroda

---

> **You are a Senior Full-Stack Engineer + System Architect with 10+ years of experience in MERN stack, real-time systems, WebRTC, AI integrations, and scalable SaaS platforms. You have built production-grade platforms used by thousands of concurrent users. You write code like it will be reviewed by Google engineers tomorrow.**
>
> I am a 3rd-year Computer Science Engineering student building a full-fledged Interview Platform as my flagship resume project — targeting internships at Microsoft, Google, and top product startups.
>
> This is NOT a tutorial project. This is a REAL, PRODUCTION-READY product.
> Take your time. Think deeply. Plan before you code. Build it like a Series-A funded startup would — clean architecture, scalable design, maintainable code, and engineering decisions a senior would be proud of.

---

## 🎯 PROJECT OVERVIEW

Build **InterviewOS** — a Web-based Interview Platform using the MERN Stack — combining the best of CoderPad + Zoom + HackerRank, but cleaner, smarter, AI-enhanced, and with built-in proctoring.

**What makes this stand out from every other student project:**
- AI-powered interview assistance (hint system, code review)
- Real-time collaborative code editing with cursor presence
- Shared collaborative whiteboard (Excalidraw) — synced via Socket.IO
- WebRTC peer-to-peer video with TURN/STUN failover
- **Browser-based proctoring system** — fullscreen enforcement, tab-switch detection, paste prevention, typing pattern analysis, 3-strike warning system
- No screen share needed — interviewer already sees code + whiteboard live
- **Complete email notification system** — 9 transactional email types
- **Post-interview thank you flow** — candidate thank you page + emails
- **Email verification** — account activation required
- Fully functional scheduling system with email notifications
- **Session Replay** — full code + whiteboard playback after interview ends (NEW)
- **AI Interviewer Mode** — GPT asks follow-up questions based on candidate's code in real-time (NEW)
- **Built-in Question Bank** — 50+ pre-loaded DSA + System Design questions with difficulty tags (NEW)
- **Interview Timer** — interviewer sets duration, countdown synced to both users (NEW)
- **Code Diff Viewer** — compare any two code snapshots post-interview (NEW)
- **Candidate Notes** — private scratchpad inside the room, not visible to interviewer (NEW)
- **AI Post-Interview Report** — GPT generates structured performance analysis after session ends (NEW)
- Production-level security, observability, and scalability

---

## 🧱 TECH STACK (MANDATORY)

### Frontend
- React.js (Vite) + TypeScript
- Tailwind CSS + shadcn/ui components
- Zustand (global state) + React Query (server state + caching)
- Monaco Editor (VS Code engine)
- Excalidraw (`@excalidraw/excalidraw`) — collaborative whiteboard
- face-api.js — face detection for proctoring (optional advanced)
- Socket.IO client
- WebRTC APIs (RTCPeerConnection only — NO screen share, not needed)
- Axios + React Router v6
- Framer Motion (animations)
- React Hook Form + Zod (form validation)
- date-fns (date formatting)
- react-hot-toast (notifications)

### Backend
- Node.js + Express.js + TypeScript
- MongoDB + Mongoose (ODM)
- Socket.IO (signaling + collaboration + whiteboard sync + proctoring alerts)
- JWT (access token: 15min) + Refresh Token (7 days, httpOnly cookie)
- bcrypt (password hashing, salt rounds: 12)
- Nodemailer + SendGrid (email notifications — 9 email types)
- node-cron (scheduled tasks — interview reminders)
- express-rate-limit + helmet + cors (security middleware)
- Zod (request validation)
- Winston + Morgan (structured logging)
- Multer + Cloudinary (avatar + resume uploads)
- Judge0 API (sandboxed code execution)
- OpenAI / Groq API (AI hints, code review, AI interviewer mode, post-interview report)
- @react-email/components (beautiful HTML email templates)

### Dev & DevOps
- ESLint + Prettier
- Husky + lint-staged (pre-commit hooks)
- Jest + Supertest (backend tests)
- Vitest + React Testing Library (frontend tests)
- Docker + Docker Compose
- GitHub Actions CI/CD
- dotenv-safe (validates required env vars)
- Swagger / OpenAPI 3.0 (API docs)

---

## 👥 USER ROLES & PERMISSIONS

### 1️⃣ Candidate
- Register / Login (email + OAuth Google)
- **Email verification required before login**
- Join interview via secure, expiring invite link
- Real-time collaborative code editor (write + run code)
- Shared whiteboard — draw diagrams, system designs
- Video + audio with interviewer (WebRTC)
- In-room chat
- **Private notes scratchpad** — jot thoughts, not visible to interviewer (NEW)
- **Proctoring enforced** — fullscreen required, violations tracked
- **Post-interview thank you page** after session ends
- **Thank you email** received after interview
- **Feedback email** when interviewer shares feedback
- **AI post-interview performance report email** — GPT-generated (NEW)
- Receive post-interview feedback (read-only)
- View past interview history
- **View session replay** — code + whiteboard playback of own past sessions (NEW)

### 2️⃣ Interviewer
- Register / Login (email + OAuth Google)
- **Email verification required before login**
- Create interview room + generate time-limited invite link
- Schedule interviews with calendar picker + timezone support
- **Pick question from built-in question bank** and push to candidate's editor (NEW)
- **Set interview duration** — countdown timer visible to both users (NEW)
- Send invite link to candidate via email (automated)
- View candidate code in real-time with cursor presence
- Draw on shared whiteboard — explain problems visually
- Video + audio
- **Live proctoring dashboard** — see violations in real-time
- Manually warn or end session on violation
- AI-generated question suggestions (role + level based)
- **AI Interviewer Mode** — toggle ON to let GPT generate follow-up questions based on what candidate just coded (NEW)
- End interview + submit structured feedback
- **Post-interview session summary email** received automatically
- **AI-generated performance report** in feedback panel (NEW)
- **Full session replay** — rewatch code + whiteboard evolution after interview (NEW)
- **Code diff viewer** — compare two snapshots side by side (NEW)
- View full violation log post-interview

### 3️⃣ Admin (Bonus)
- User management (ban, promote, demote)
- Room management (force-end sessions)
- Analytics: total interviews, active users, system health
- Audit logs

---

## 🔐 AUTHENTICATION & SECURITY

- JWT dual-token strategy (15min access + 7-day refresh in httpOnly cookie)
- OAuth 2.0 via Google (Passport.js)
- RBAC enforced at route-level middleware
- **Email verification required** — unverified accounts blocked from login
- **Resend verification email** option on login page
- Invite token: signed JWT with roomId + expiresAt (24 hours)
- bcrypt password hashing (12 salt rounds)
- Rate limiting: 100 req/15min per IP
- Helmet.js security headers
- CSRF protection for cookie-based auth
- Input validation on every route (Zod schemas)
- MongoDB injection prevention (mongo-sanitize)
- Protected frontend routes (React Router + auth guard)
- Session invalidation on logout (refresh token blacklist)
- dotenv-safe (crash on missing env vars)

### Register Flow:
```
1. Fill form (name, email, password, role)
2. Submit → Account created (unverified)
3. Redirect to: /verify-email-sent
   "Check your inbox! We sent a verification
    link to [email]"
   [Resend Email] button
4. Click email link → /verify-email?token=xxx
5. Token verified → Account activated
6. Redirect to dashboard with:
   🎉 "Email verified! Welcome to InterviewOS"
```

### Login Flow:
```
1. Enter email + password
2. If unverified → Show banner:
   "Please verify your email first"
   [Resend verification email]
3. If verified → JWT tokens issued
4. Redirect to role-based dashboard
```

### Forgot Password Flow:
```
1. /forgot-password → Enter email
2. Email sent: "Reset your password"
3. /reset-password?token=xxx
4. New password form
5. Success → Redirect to login
   "Password reset successfully!"
```

---

## 📧 EMAIL SYSTEM — COMPLETE FLOW (10 Email Types)

### Email Design System
```
All emails follow consistent design:
- InterviewOS logo at top
- Clean white card layout
- Primary color: Indigo (#6366f1)
- Font: System fonts (safe for email)
- CTA button: Indigo background, white text
- Footer: Logo + social links + unsubscribe
- Mobile responsive
- Built with: @react-email/components
```

### 1. Email Verification (After Register)
```
Subject: "Verify your InterviewOS email"
Content:
- InterviewOS logo
- "Welcome [Name]!" heading
- Verify button (styled, not plain link)
- Link expires in 24 hours
- Resend verification option on login page
```

### 2. Welcome Email (After Verification)
```
Subject: "Welcome to InterviewOS! 🚀"
Content:
- "Your account is verified and ready"
- Quick start guide:
  → For Interviewers: Create your first room
  → For Candidates: Complete your profile
- Feature highlights
- Support link
```

### 3. Interview Scheduled — Interviewer
```
Subject: "Interview Scheduled — [Candidate Name] | [Date]"
Content:
- Room link
- Candidate name + email
- Scheduled time + timezone
- Tech stack
- Difficulty level
- "Join Room" button
- Add to Calendar button (Google/Outlook)
```

### 4. Interview Invite — Candidate
```
Subject: "You've been invited for a Technical Interview"
Content:
- Company/Interviewer name
- Date + Time + Timezone
- Tech stack expected
- "Join Interview" button (secure link)
- Tips: "Test your camera/mic before joining"
- Interview preparation checklist
```

### 5. Interview Reminder — Both (30 min before via cron)
```
Subject: "Reminder: Your interview starts in 30 minutes"
Content:
- Room link
- Quick checklist
- "Join Now" button
```

### 6. Post-Interview Thank You — Candidate
```
Sent: Automatically when interviewer ends session
Subject: "Thank you for interviewing with InterviewOS 🙏"
Content:
- "Thank you [Name] for taking the time today"
- Interview summary:
  → Duration
  → Languages used
  → Problems attempted
- "Your interviewer will share feedback soon"
- Tips for next interview
- InterviewOS branding footer
- Social links
```

### 7. Post-Interview Session Summary — Interviewer
```
Sent: Automatically when session ends
Subject: "Interview Summary — [Candidate Name]"
Content:
- Session duration
- Code snapshots count
- Languages used
- Violation log summary (if any)
- "Submit Feedback" button (direct link)
```

### 8. Feedback Shared — Candidate Notification
```
Sent: When interviewer submits + shares feedback
Subject: "Your Interview Feedback is Ready 📋"
Content:
- Overall recommendation
- Ratings summary (visual stars)
- Strengths mentioned
- Areas to improve
- "View Full Feedback" button
```

### 9. Password Reset Email
```
Subject: "Reset your InterviewOS password"
Content:
- Reset button
- Link expires in 1 hour
- "Didn't request this? Ignore" note
```

### 10. AI Performance Report — Candidate (NEW)
```
Sent: Automatically 15 minutes after session ends (GPT needs time to process)
Subject: "Your InterviewOS Performance Report is Ready 🤖"
Content:
- GPT-generated structured analysis:
  → Code quality assessment (1-5 with explanation)
  → Problem-solving approach analysis
  → Time complexity of submitted solutions
  → Key strengths demonstrated
  → Top 3 improvement areas with specific resources
  → Recommended LeetCode/Neetcode problems to practice
- "View Full Report" button (links to dashboard)
- Note: "This is an AI-generated analysis, not the interviewer's official feedback"
```

---

## 🔚 POST-INTERVIEW FLOW (Complete)

### When Interviewer Clicks "End Interview":
```
Step 1 — Confirmation modal:
  "End this interview session?"
  [Cancel] [End Interview]

Step 2 — Session wrap-up (auto):
  → Save final code snapshot
  → Save whiteboard snapshot
  → Calculate session duration
  → Save violation log
  → Mark room status: "completed"
  → Save all snapshots for session replay (NEW)

Step 3 — Redirect Interviewer to:
  /feedback/[roomId]
  → Pre-filled feedback form
  → Candidate name + session summary
  → Rating rubrics (1-5)
  → Strengths + Improvements text areas
  → Recommendation dropdown
  → "Share with Candidate" toggle
  → AI Performance Report preview (GPT-generated) (NEW)
  → Submit button

Step 4 — Emails sent automatically:
  → Candidate: Thank you email
  → Interviewer: Session summary email
  → Candidate: AI performance report email (after 15 min) (NEW)

Step 5 — When feedback submitted:
  → If "Share with Candidate" ON:
     Candidate gets feedback email
  → Both get final summary
```

### Candidate Post-Interview Experience:
```
Interview ends →
Redirect to: /interview/[roomId]/thankyou

Beautiful thank you page:
  ✅ "Interview Complete!"
  → "Thank you [Name] for your time today"
  → Session stats (duration, languages used)
  → "Your interviewer will share feedback soon"
  → "Check your email for confirmation"
  → Tips while you wait:
     "Practice on LeetCode"
     "Review system design concepts"
  → Share on LinkedIn button:
     "I just completed a technical interview
      on InterviewOS!"
  → Back to Dashboard button
```

---

## 🎥 VIDEO CALLING (WebRTC)

### Core Implementation
- RTCPeerConnection (P2P video + audio only)
- Socket.IO as signaling server (offer → answer → ICE)
- STUN server: `stun:stun.l.google.com:19302`
- TURN server: Coturn or Twilio TURN (fallback)
- Camera on/off toggle
- Mic mute/unmute
- Speaking detection via Web Audio API (animated indicator)
- Connection quality indicator (RTCStats polling every 3s)
- Auto-reconnect on ICE failure

### ❌ No Screen Share
Screen sharing is intentionally removed because:
- Interviewer already sees candidate's code live in the editor
- Interviewer already sees candidate's diagrams on the whiteboard
- Screen share would be redundant and add UX clutter
- Removing it shows intentional product thinking

---

## 💻 CODE EDITOR

### Core Features
- Monaco Editor (VS Code engine)
- Languages: JavaScript, TypeScript, Python, Java, C++, Go, Rust
- Theme: VS Code Dark+ (default)
- Syntax highlighting, IntelliSense, auto-indent, bracket matching
- Font: JetBrains Mono with ligatures

### Real-Time Collaboration
- Y.js CRDT for conflict-free collaborative editing
- Cursor presence (other user's cursor with name label + color)
- Real-time sync via Socket.IO
- "Interviewer is typing..." awareness indicator

### Code Execution
- Judge0 API (sandboxed execution)
- Supported: JS, Python, Java, C++, TypeScript, Go, Rust
- Show: stdout, stderr, execution time, memory usage
- Rate-limit: max 10 runs/session

### Code Snapshots
- Auto-save every 30 seconds to MongoDB
- Manual save (Ctrl+S)
- Snapshot history viewable post-interview
- Code diff view: compare two snapshots (Monaco DiffEditor)

### AI Features
- "AI Review" button → GPT analyzes code
- Returns: correctness, time complexity, space complexity, edge cases
- 3-level hint system: nudge → direction → near-solution
- Rate-limited: 3 hints per session

---

## 🎬 SESSION REPLAY (NEW MODULE)

### What It Is
```
After every completed interview, both interviewer and candidate can
"replay" the entire session — watching code evolve snapshot by snapshot,
whiteboard drawings appear stroke by stroke, and seeing the timeline of
the full session. Same technology concept as HackerRank's session replay
feature — a major differentiator from typical student projects.
```

### How It Works
```
During interview:
  → Code snapshots saved every 30 seconds (already in system)
  → Whiteboard state serialized and saved on every major change
  → Chat messages timestamped
  → Violation events timestamped
  → All events stored with relative timestamp from session start

Post-interview replay page (/room/[roomId]/replay):
  → Timeline scrubber (0:00 → session duration)
  → Playback controls: Play | Pause | 2x Speed | Jump to timestamp
  → Code panel: Monaco (read-only) — shows code at each snapshot point
  → Whiteboard panel: Excalidraw (read-only) — shows whiteboard state at timestamp
  → Event markers on timeline:
     🔵 Code save (manual/auto)
     🟢 Code run (execution)
     🔴 Proctoring violation
     💬 Chat message
     🤖 AI hint requested
  → Click any marker → jump to that moment
```

### Replay Data Model
```
Each ReplayFrame stored in InterviewSession:
{
  timestamp: number,        // seconds from session start
  type: 'code' | 'whiteboard' | 'violation' | 'chat' | 'execution',
  payload: {
    code?: string,          // current code state
    language?: string,
    whiteboardElements?: ExcalidrawElement[],
    violationType?: string,
    message?: string,
    executionResult?: {...}
  }
}
```

### Implementation Notes
```
→ ReplayFrames stored as array in InterviewSession document
→ Frontend: custom useReplay() hook manages playback state
→ Timeline component: custom built with CSS + mouse events
→ Playback uses setInterval stepping through frames by timestamp
→ 2x speed = interval halved
→ Jump to marker = find nearest frame index + seek there
→ Read-only Monaco: editor.updateOptions({ readOnly: true })
→ Read-only Excalidraw: viewModeEnabled prop = true
→ Access control: only session's interviewer + candidate can view replay
```

---

## ❓ BUILT-IN QUESTION BANK (NEW MODULE)

### What It Is
```
A curated library of 50+ interview questions pre-loaded into the system.
Interviewer can browse, filter, preview, and push any question directly
to the candidate's editor as the problem statement — no copy-paste needed.
This is a standard feature of every production interview platform.
```

### Question Schema
```typescript
interface Question {
  _id: string;
  title: string;           // e.g., "Two Sum"
  slug: string;            // e.g., "two-sum"
  category: 'DSA' | 'System Design' | 'Frontend' | 'Backend' | 'Behavioral';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];          // e.g., ["array", "hashmap", "two-pointer"]
  description: string;     // full markdown problem statement
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: {           // language-specific starter templates
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
  hints: string[];         // 3-level hints for AI hint system
  solution: string;        // hidden from candidates — interviewer only
  timeComplexity: string;  // expected optimal solution complexity
  spaceComplexity: string;
  companies: string[];     // e.g., ["Google", "Amazon", "Microsoft"]
  createdAt: Date;
}
```

### Pre-Loaded Questions (50+)
```
DSA — Easy (15 questions):
  Two Sum, Valid Parentheses, Reverse Linked List, Maximum Subarray,
  Climbing Stairs, Best Time to Buy and Sell Stock, Valid Anagram,
  Contains Duplicate, Merge Sorted Array, First Unique Character,
  Palindrome Number, Fizz Buzz, Missing Number, Single Number, Move Zeroes

DSA — Medium (20 questions):
  3Sum, Longest Substring Without Repeating Characters, Group Anagrams,
  Product of Array Except Self, Valid Sudoku, Merge Intervals, Jump Game,
  Rotate Array, Binary Search, Find Minimum in Rotated Array, Search in
  Rotated Sorted Array, Kth Largest Element, Top K Frequent Elements,
  Word Search, Number of Islands, Course Schedule, Coin Change,
  Unique Paths, Decode Ways, Longest Palindromic Substring

DSA — Hard (10 questions):
  Merge K Sorted Lists, Trapping Rain Water, N-Queens, Word Ladder,
  Serialize and Deserialize Binary Tree, Minimum Window Substring,
  Sliding Window Maximum, Largest Rectangle in Histogram,
  Regular Expression Matching, Edit Distance

System Design (5 questions):
  Design URL Shortener, Design Twitter Feed, Design Rate Limiter,
  Design Notification System, Design Cache System
```

### Question Bank UI
```
/questions page (interviewer only):

  Filters: [Category ▼] [Difficulty ▼] [Tag ▼] [Search...]
  
  Question cards:
    Two Sum        [Easy]  [Array] [Hashmap]   ⭐ Amazon, Google
    [Preview] [Push to Room]
  
  Preview modal:
    → Full problem statement (markdown rendered)
    → Examples + constraints
    → Starter code tabs (JS / Python / Java / C++)
    → Solution (interviewer only — blurred by default, click to reveal)
    → [Push to Room] button — sends question to active room
  
  "Push to Room" flow:
    → Sends question:push socket event to room
    → Candidate sees: "New problem received!" toast
    → Problem statement appears in a dedicated panel above editor
    → Starter code auto-fills into Monaco editor
    → Language selector auto-sets to question's default language
```

---

## ⏱️ INTERVIEW TIMER (NEW MODULE)

### What It Is
```
When creating a room, interviewer sets a duration (30/45/60/90 min or custom).
A countdown timer is visible to both users inside the room, synced via Socket.IO.
When timer hits 0, interviewer gets an alert but session is NOT auto-ended
(interviewer controls when to end — timer is advisory, not mandatory).
```

### Timer Implementation
```
Room creation: durationMinutes field (default: 60)

In room:
  → Timer starts when interviewer clicks "Start Interview"
  → interview:start socket event broadcasts startTime to all participants
  → Both clients calculate endTime = startTime + durationMinutes * 60000
  → Both show the same countdown: MM:SS
  → At 10 min remaining: timer turns yellow, toast: "10 minutes left"
  → At 5 min remaining: timer turns red, pulsing animation
  → At 0:00: interviewer gets modal: "Time is up. End the interview?"
              Candidate sees: "Time's up! Waiting for interviewer..."
  → Interviewer can dismiss and continue, or click End Interview

Socket event:
  interview:timer-start → { startTime, durationSeconds }
  interview:timer-warning → { minutesLeft: 10 | 5 | 0 }
```

---

## 🤖 AI INTERVIEWER MODE (NEW MODULE)

### What It Is
```
When toggled ON by the interviewer, GPT watches the candidate's code in real-time
and automatically generates contextual follow-up questions — just like a real
senior engineer would ask: "Why did you use a hashmap here?", "What's the time
complexity of this approach?", "How would you handle the edge case when input is empty?"

This makes InterviewOS closer to a real live interview than any other student project.
```

### How It Triggers
```
Interviewer panel: [AI Interviewer Mode: OFF ●] → toggle → [AI Interviewer Mode: ON ●]

Trigger conditions:
  → Every time candidate runs code (code execution event)
  → Every time candidate saves manually (Ctrl+S)
  → Every 5 minutes of continuous typing (debounced)
  → Never more than once every 3 minutes (rate limit)
  → Max 5 AI questions per session (prevents overwhelming candidate)
```

### GPT Prompt (Behind the Scenes)
```
System:
"You are an experienced technical interviewer conducting a live coding interview.
The candidate just wrote/modified the following code. Generate ONE follow-up
question that a senior engineer would naturally ask. Keep it concise (1-2 sentences).
Focus on: time complexity, edge cases, alternative approaches, or design decisions.
Do NOT give hints or reveal issues. Only ASK a question.

Current problem: {problem_statement}
Candidate's current code: {current_code}
Language: {language}
Previous AI questions asked: {previous_questions}

OUTPUT FORMAT (JSON):
{
  'question': '...',
  'category': 'complexity | edge_case | alternative | design'
}"
```

### UI Implementation
```
In interview room — interviewer side:
  → Toggle button in toolbar
  → When AI generates question: appears in "AI Suggestions" panel (right sidebar)
  → Interviewer can:
     [Ask This] → question sent to room chat as "AI Interviewer: ..."
     [Skip]     → dismiss without asking
     [Edit + Ask] → edit the question first, then send

In interview room — candidate side:
  → AI questions appear in chat as: 🤖 "Interviewer: [question]"
  → Visually distinguished from human chat messages
  → Candidate responds in chat normally
```

---

## 📊 AI POST-INTERVIEW REPORT (NEW MODULE)

### What It Is
```
15 minutes after session ends, GPT analyzes the entire session — all code snapshots,
execution results, proctoring events, and interview duration — and generates a
structured performance report for the candidate. This is the kind of feedback
candidates actually want but never get from real interviews.
```

### GPT Prompt
```
System:
"You are a senior software engineer reviewing a technical interview performance.
Analyze the following interview session data and generate a structured performance report.

SESSION DATA:
- Problem: {problem_statement}
- Total duration: {duration} minutes
- Code snapshots (chronological): {all_code_snapshots}
- Final code: {final_code}
- Language: {language}
- Execution results: {all_execution_results}
- Number of runs: {run_count}
- Hints requested: {hint_count}
- Proctoring violations: {violation_count}

Generate a structured report with:
1. Overall Score (1-10) with justification
2. Code Quality (correctness, readability, naming)
3. Problem-Solving Approach (initial thinking, pivots, efficiency)
4. Time Complexity of final solution (actual analysis)
5. Top 3 Strengths (specific, evidence-based from their code)
6. Top 3 Areas to Improve (specific, with actionable advice)
7. 3 Recommended LeetCode problems to practice based on weaknesses
8. One-paragraph overall summary

OUTPUT FORMAT: JSON following ReportSchema"
```

### Report Display
```
/room/[roomId]/report page:

  🤖 AI Performance Report
  Generated based on your session

  Overall Score: 7.2 / 10
  ████████░░░░ 72%

  ✅ Code Quality: 8/10
  Your variable naming was clear and consistent.
  The solution structure was readable.

  🧠 Problem-Solving: 6/10
  You correctly identified the hashmap approach after
  an initial brute-force attempt (good recovery).

  ⏱️ Time Complexity: O(n) — Correct ✓
  Your final solution achieves the optimal complexity.

  💪 Strengths:
  1. Clean code structure
  2. Good edge case handling for empty input
  3. Efficient pivot from O(n²) to O(n)

  📈 Improve On:
  1. Consider space complexity tradeoffs earlier
  2. Add comments for non-obvious logic
  3. Test with negative numbers (missed edge case)

  📚 Practice These Next:
  → Group Anagrams (Medium) — hashmap patterns
  → Subarray Sum Equals K (Medium) — prefix sum
  → LRU Cache (Medium) — design + hashmap combo

  [Share on LinkedIn] [Download PDF] [Back to Dashboard]
```

---

## 🖊️ COLLABORATIVE WHITEBOARD (Excalidraw)

### Overview
Shared real-time whiteboard inside the interview room. Both users draw simultaneously — synced instantly via Socket.IO.

### Why This Feature
- Candidate draws system design diagrams, trees, graphs, flowcharts
- Interviewer sketches problem visually
- Most platforms don't have this — makes InterviewOS unique
- Replaces need for screen share entirely

### Tools Available
- Pen (freehand), Line, Rectangle, Circle, Arrow, Text, Eraser
- Color picker, stroke width selector
- Clear board button (interviewer only)
- Grid background for clean diagrams

### Implementation
```bash
npm install @excalidraw/excalidraw
```
- Toggle: center panel switches between Editor and Whiteboard
- Socket.IO syncs whiteboard state in real-time
- Whiteboard snapshot saved to MongoDB at interview end

### Whiteboard Socket Events
```
whiteboard:change   — drawing update (payload: { elements, appState })
whiteboard:sync     — full state sync when user joins mid-session
whiteboard:clear    — clear board (interviewer only)
whiteboard:save     — save snapshot at interview end
```

---

## 🔒 PROCTORING SYSTEM (Anti-Cheat)

### Overview
Browser-based proctoring enforces interview integrity — similar to HackerRank's and Codility's enterprise proctoring. Candidate cannot cheat by Googling answers, switching tabs, or copy-pasting code.

### Why No Screen Share Instead
Proctoring is smarter than screen share:
- Screen share = candidate controls what you see
- Proctoring = system enforces rules automatically
- Violations logged + interviewer alerted in real-time

### Features

**1. Fullscreen Enforcement**
```javascript
document.documentElement.requestFullscreen();
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) triggerWarning('fullscreen_exit');
});
```

**2. Tab Switch / Window Blur Detection**
```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) triggerWarning('tab_switch');
});
window.addEventListener('blur', () => {
  triggerWarning('window_blur');
});
```

**3. Paste Prevention in Editor**
```javascript
editor.onDidPaste(() => {
  editor.trigger('keyboard', 'undo', null);
  triggerWarning('paste_attempt');
});
```

**4. Typing Pattern Analysis**
```javascript
editor.onDidChangeModelContent(() => {
  const diff = currentLength - lastLength;
  if (diff > 20) triggerWarning('suspicious_paste');
  lastLength = currentLength;
});
```

**5. (Advanced) Face Detection**
```javascript
// face-api.js — detect if candidate looks away
// No face detected = warning
// Multiple faces detected = warning (someone helping)
```

### Warning System (3-Strike Rule)
```
Warning 1 → 🟡 Candidate sees toast: "Violation detected — tab switch"
             Interviewer gets real-time Socket.IO alert
             Violation logged to DB

Warning 2 → 🟠 Stronger warning to candidate
             Interviewer notified with violation type + timestamp

Warning 3 → 🔴 Session auto-ended
             Full violation log saved
             Interviewer sees complete report
             Both receive violation summary email
```

### Proctoring Socket Events
```
proctor:warning     — violation detected (payload: { type, count, timestamp })
proctor:alert       — interviewer notified of candidate violation
proctor:end-session — 3 strikes — auto end
proctor:log         — save violation to DB
```

### Violation Types Tracked
```
fullscreen_exit     — candidate exited fullscreen
tab_switch          — switched to another tab
window_blur         — switched to another app
paste_attempt       — tried to paste code
suspicious_paste    — large code block appeared suddenly
no_face_detected    — face not visible (advanced)
multiple_faces      — someone else in frame (advanced)
```

### Interviewer Proctoring Panel (Live)
```
Proctoring Status: 🟢 Active
Violations: 2/3

Timeline:
⚠️ 14:23 — Tab switched (3 sec)
⚠️ 14:31 — Paste attempt blocked
[End Session] button always visible
```

### Post-Interview Violation Report
- Full violation log visible in feedback panel
- Timestamps + violation types
- Interviewer can factor into hiring decision

---

## 🧠 REAL-TIME FEATURES (Socket.IO Event Map)

### Connection Events
```
connection            — new socket connected
disconnect            — socket disconnected
room:join             — user joins room (payload: { roomId, userId, role })
room:leave            — user leaves room
room:user-joined      — broadcast when participant joins
room:user-left        — broadcast when participant leaves
```

### Code Collaboration Events
```
code:change           — code delta from editor
code:sync             — full code sync on join
code:cursor           — cursor position update
code:language         — language changed
code:save             — manual save triggered
code:saved            — save confirmed from server
```

### Whiteboard Events
```
whiteboard:change     — drawing update
whiteboard:sync       — full state sync on join
whiteboard:clear      — clear board (interviewer only)
whiteboard:save       — save snapshot
```

### Proctoring Events
```
proctor:warning       — violation detected
proctor:alert         — interviewer notified
proctor:end-session   — 3 strikes, auto end
proctor:log           — save to DB
```

### Chat Events
```
chat:message          — new message
chat:typing           — typing indicator
chat:history          — load last N messages on join
```

### WebRTC Signaling Events
```
rtc:offer             — WebRTC offer SDP
rtc:answer            — WebRTC answer SDP
rtc:ice-candidate     — ICE candidate
rtc:user-ready        — user media ready
rtc:peer-disconnected — peer left unexpectedly
```

### Interview Control Events
```
interview:start       — interviewer starts session
interview:end         — interviewer ends session
interview:timer-start — countdown timer begins (NEW)
interview:timer-sync  — timer sync for late joiners (NEW)
interview:timer-warning — timer alerts at 10min/5min/0 (NEW)
interview:question    — interviewer pushes question to candidate
interview:note        — private interviewer note
```

### AI Interviewer Events (NEW)
```
ai:question-ready     — GPT generated a follow-up question (to interviewer)
ai:question-sent      — interviewer approved + sent question (to both)
ai:question-skipped   — interviewer dismissed the question
```

### System Events
```
system:error          — server error
system:ping           — keepalive ping
system:pong           — keepalive pong
```

---

## 🗂️ DATABASE MODELS

### User
```
_id, name, email (unique, indexed), passwordHash,
role (enum: candidate|interviewer|admin),
isEmailVerified, emailVerifyToken, emailVerifyExpires,
avatar (Cloudinary URL), googleId,
phone, linkedin, github, portfolio,
company, designation, skills[],
refreshTokens[], createdAt, updatedAt
```

### InterviewRoom
```
_id, roomId (nanoid, unique, indexed), title, description,
interviewer (ref: User), candidate (ref: User),
scheduledAt, durationMinutes,
status (enum: scheduled|active|completed|cancelled),
inviteToken, inviteExpiresAt, problemStatement,
questionId (ref: Question),               ← NEW: linked question bank question
techStack[], difficultyLevel (enum: easy|medium|hard),
aiInterviewerEnabled (Boolean, default: false),  ← NEW
createdAt, updatedAt
```

### InterviewSession
```
_id, room (ref: InterviewRoom), startTime, endTime,
durationSeconds, finalCode, finalLanguage,
codeSnapshots (array of refs),
replayFrames (array of ReplayFrame),       ← NEW: for session replay
whiteboardSnapshot (JSON — Excalidraw elements),
violationLog (array of { type, timestamp, count }),
proctoringResult (enum: clean|warned|terminated),
aiReport (ref: AIReport),                  ← NEW: link to AI performance report
aiInterviewerQuestions (array of {         ← NEW: log of AI-generated questions
  question: String,
  askedAt: Date,
  category: String
}),
thankYouEmailSent, summaryEmailSent, aiReportEmailSent,  ← NEW field
recordingUrl (Cloudinary), createdAt
```

### ChatMessage
```
_id, room (ref: InterviewRoom), sender (ref: User),
message (sanitized), messageType (enum: text|system|ai_question),  ← NEW type
timestamp (indexed), isDeleted
```

### CodeSnapshot
```
_id, room (ref: InterviewRoom), session (ref: InterviewSession),
language, code, triggeredBy (enum: auto|manual|interview_end),
savedAt (indexed),
executionResult { stdout, stderr, time, memory }
```

### Feedback
```
_id, room (ref: InterviewRoom), session (ref: InterviewSession),
interviewer (ref: User), candidate (ref: User),
ratings { problemSolving, codeQuality, communication, efficiency } (1-5),
strengths, improvements, overallNotes,
recommendation (enum: strong_yes|yes|no|strong_no),
proctoringViolations (ref to session violationLog),
isSharedWithCandidate, feedbackEmailSent,
submittedAt
```

### Question (NEW)
```
_id, title, slug (unique, indexed), category, difficulty,
tags[], description, examples[], constraints[],
starterCode { javascript, python, java, cpp },
hints[], solution, timeComplexity, spaceComplexity,
companies[], isActive (Boolean),
createdAt, updatedAt
```

### AIReport (NEW)
```
_id, session (ref: InterviewSession), candidate (ref: User),
room (ref: InterviewRoom),
overallScore (Number, 1-10),
codeQualityScore (Number), codeQualityFeedback (String),
problemSolvingScore (Number), problemSolvingFeedback (String),
timeComplexityAnalysis (String),
strengths (String[]),
improvements (String[]),
recommendedProblems (Array of { title, difficulty, url }),
overallSummary (String),
generatedAt (Date),
emailSent (Boolean, default: false)
```

### AuditLog
```
_id, actor (ref: User), action, target,
metadata (Mixed), ip, userAgent, createdAt
```

---

## 🧩 SYSTEM ARCHITECTURE

### Client ↔ Server
```
[React Client]
    │
    ├── REST API (Axios) ────────────────► [Express REST API]
    │                                            │
    ├── WebSocket (Socket.IO) ──────────► [Socket.IO Server]
    │   code + whiteboard + chat                 │
    │   proctoring + signaling                   │
    │   timer + AI interviewer                   │
    │                                      [MongoDB Atlas]
    └── WebRTC P2P ──────────────────────► [Peer Browser]
        (video + audio, direct)            [Cloudinary]
                                           [Judge0 API]
                                           [OpenAI/Groq]
                                           [SendGrid]
```

### WebRTC Signaling Flow
```
Caller              Socket Server           Callee
  │── rtc:user-ready ──────────────────────►│
  │── createOffer() ─────► rtc:offer ───────►│
  │◄────────────────────── rtc:answer ───────│
  │◄──────────── ICE Candidates Exchange ────│
  [P2P Video + Audio — Direct Connection]
```

### Proctoring Flow
```
Candidate Browser
  │
  ├── Fullscreen exits ──────────────────► triggerWarning()
  ├── Tab switches ───────────────────────► triggerWarning()
  ├── Paste detected ─────────────────────► triggerWarning()
  └── Typing pattern ─────────────────────► triggerWarning()
                                               │
                                    emit proctor:warning
                                               │
                              ┌────────────────┴────────────────┐
                              │                                 │
                    Candidate Toast                  Interviewer Alert
                    (warning shown)                 (real-time panel)
                              │
                    count >= 3 → auto end session
                    violation saved to DB
                    both receive violation summary email
```

### Session Replay Flow (NEW)
```
During Interview:
  Every 30s → Code snapshot saved to DB → added to replayFrames[]
  On whiteboard change → whiteboard state serialized → added to replayFrames[]
  On violation → violation event added to replayFrames[]
  On execution → execution result added to replayFrames[]

Post-Interview:
  /room/[roomId]/replay →
  Fetch all replayFrames (sorted by timestamp) →
  useReplay() hook initializes timeline →
  setInterval steps through frames at playback speed →
  Monaco + Excalidraw updated at each frame
```

---

## 🗂️ FOLDER STRUCTURE

### Backend (`/server`)
```
server/src/
├── config/
│   ├── db.ts
│   ├── env.ts
│   └── email.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── room.controller.ts
│   ├── code.controller.ts
│   ├── feedback.controller.ts
│   ├── proctor.controller.ts
│   ├── question.controller.ts     ← NEW
│   ├── replay.controller.ts       ← NEW
│   ├── aiReport.controller.ts     ← NEW
│   └── user.controller.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── rbac.middleware.ts
│   ├── rateLimit.middleware.ts
│   └── validate.middleware.ts
├── models/
│   ├── user.model.ts
│   ├── room.model.ts
│   ├── session.model.ts
│   ├── snapshot.model.ts
│   ├── message.model.ts
│   ├── feedback.model.ts
│   ├── question.model.ts          ← NEW
│   └── aiReport.model.ts          ← NEW
├── routes/
├── services/
│   ├── email.service.ts         ← all 10 email types
│   ├── judge0.service.ts
│   ├── ai.service.ts            ← hints + review + AI interviewer + report
│   ├── replay.service.ts        ← NEW: build + serve replay data
│   └── storage.service.ts
├── socket/
│   ├── handlers/
│   │   ├── chat.handler.ts
│   │   ├── code.handler.ts
│   │   ├── rtc.handler.ts
│   │   ├── whiteboard.handler.ts
│   │   ├── proctor.handler.ts
│   │   ├── timer.handler.ts      ← NEW
│   │   └── aiInterviewer.handler.ts  ← NEW
│   └── index.ts
├── templates/email/              ← HTML email templates
│   ├── verify-email.html
│   ├── welcome.html
│   ├── interview-invite.html
│   ├── interview-scheduled.html
│   ├── interview-reminder.html
│   ├── post-interview-candidate.html
│   ├── post-interview-interviewer.html
│   ├── feedback-ready.html
│   ├── reset-password.html
│   └── ai-performance-report.html   ← NEW
├── jobs/
│   ├── reminder.cron.ts          ← 30 min reminder cron
│   └── aiReport.cron.ts          ← NEW: generate AI reports 15min after session
├── utils/
│   ├── logger.ts
│   ├── jwt.ts
│   └── crypto.ts
├── types/
└── app.ts
```

### Frontend (`/client`)
```
client/src/
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── VerifyEmailSentPage.tsx
│   │   ├── VerifyEmailPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── dashboard/
│   │   ├── InterviewerDashboard.tsx
│   │   └── CandidateDashboard.tsx
│   ├── room/
│   │   ├── InterviewRoom.tsx
│   │   ├── ThankYouPage.tsx
│   │   └── ReplayPage.tsx           ← NEW
│   ├── questions/
│   │   └── QuestionBank.tsx         ← NEW (interviewer only)
│   ├── report/
│   │   └── AIReportPage.tsx         ← NEW
│   ├── feedback/
│   │   ├── FeedbackForm.tsx
│   │   └── FeedbackView.tsx
│   └── profile/
│       └── ProfilePage.tsx
├── components/
│   ├── common/
│   ├── editor/
│   ├── whiteboard/
│   ├── video/
│   ├── chat/
│   ├── proctor/
│   ├── timer/                       ← NEW: CountdownTimer component
│   ├── replay/                      ← NEW: ReplayControls, ReplayTimeline
│   ├── question-bank/               ← NEW: QuestionCard, QuestionPreview
│   ├── ai-interviewer/              ← NEW: AIQuestionPanel
│   └── email-banner/
├── hooks/
│   ├── useWebRTC.ts
│   ├── useSocket.ts
│   ├── useEditor.ts
│   ├── useWhiteboard.ts
│   ├── useProctor.ts
│   ├── useTimer.ts                  ← NEW
│   ├── useReplay.ts                 ← NEW
│   └── useAIInterviewer.ts          ← NEW
├── store/
├── lib/
├── types/
└── App.tsx
```

---

## 🌐 REST API DESIGN

### Auth `/api/v1/auth`
```
POST   /register
POST   /login
POST   /logout
POST   /refresh
POST   /forgot-password
POST   /reset-password
GET    /me
POST   /google
POST   /verify-email
POST   /resend-verification
```

### Rooms `/api/v1/rooms`
```
POST   /
GET    /
GET    /:roomId
PATCH  /:roomId
DELETE /:roomId
POST   /:roomId/invite
GET    /join/:inviteToken
POST   /:roomId/start
POST   /:roomId/end
```

### Code `/api/v1/rooms/:roomId/code`
```
GET    /snapshots
GET    /snapshots/:id
POST   /execute
POST   /ai-review
POST   /hint
```

### Whiteboard `/api/v1/rooms/:roomId/whiteboard`
```
GET    /snapshot
POST   /snapshot
```

### Proctoring `/api/v1/rooms/:roomId/proctor`
```
GET    /violations
POST   /violations
POST   /end
```

### Feedback `/api/v1/feedback`
```
POST   /
GET    /:roomId
PATCH  /:roomId/share
```

### Questions `/api/v1/questions` (NEW)
```
GET    /                    — list all (with filters: category, difficulty, tag)
GET    /:id                 — get single question (solution hidden for candidates)
GET    /slug/:slug          — get by slug
POST   /                    — create (admin only)
PATCH  /:id                 — update (admin only)
POST   /seed                — seed 50+ questions from JSON (admin only)
```

### Replay `/api/v1/rooms/:roomId/replay` (NEW)
```
GET    /                    — get full replay frames for a session
GET    /summary             — get session summary (duration, events count, etc)
```

### AI Report `/api/v1/rooms/:roomId/report` (NEW)
```
GET    /                    — get AI report for this session (candidate/interviewer)
POST   /generate            — manually trigger AI report generation
```

### Users `/api/v1/users`
```
GET    /profile
PATCH  /profile
PATCH  /password
GET    /:id/interviews
```

### Admin `/api/v1/admin`
```
GET    /users
PATCH  /users/:id/role
DELETE /users/:id
GET    /rooms
POST   /rooms/:id/force-end
GET    /analytics
GET    /logs
```

---

## 👤 USER PROFILE (Production-Grade)

### Candidate Profile:
```
- Avatar upload (Cloudinary)
- Full name, email (read-only after verify)
- Phone number
- LinkedIn URL
- GitHub URL
- Portfolio URL
- Skills (tag input)
- Resume upload (PDF, Cloudinary)
- Interview history (read-only)
- Feedback received (if shared)
- AI Performance Reports history (NEW)
```

### Interviewer Profile:
```
- Avatar upload
- Full name, company name
- Designation
- LinkedIn URL
- Interview history
- Total interviews conducted
- Average session duration
- Favorite questions from question bank (NEW)
```

---

## 🏠 DASHBOARD (Role-Based)

### Interviewer Dashboard:
```
Header stats:
- Total interviews conducted
- This month's interviews
- Average duration
- Pending feedbacks

Quick Actions:
- [+ Schedule Interview] — primary CTA
- [View All Rooms]
- [Question Bank]         ← NEW
- [Pending Feedbacks]

Upcoming Interviews table:
- Candidate name | Date | Time | Status
- [Join] [Edit] [Cancel] buttons

Recent Interviews:
- Candidate | Duration | Status | Feedback | Replay  ← NEW column
- [View] [Feedback] [▶ Replay] buttons

Proctoring Alerts:
- Sessions with violations highlighted
```

### Candidate Dashboard:
```
Header:
- "Welcome back, [Name]!"
- Profile completion %

Upcoming Interviews:
- Interviewer | Company | Date | Time
- [Join] button (active 5 min before)

Past Interviews:
- Date | Duration | Feedback status | AI Report  ← NEW column
- [View Feedback] [📊 View Report] [▶ Replay] if available  ← NEW

Quick Tips section:
- Practice problem of the day
- System design resource
```

---

## 🎨 UI / UX

### Design System
- Dark theme: background `#0f0f0f`, surface `#1a1a1a`, accent indigo
- shadcn/ui components
- Framer Motion transitions
- Skeleton loaders on all async data
- Toast notifications for all actions

### Interview Room Layout (Updated)
```
┌─────────────────────────────────────────────────────────────────┐
│ Header: InterviewOS | Room | ⏱️ 42:15 | Connected | End        │
├──────────────┬──────────────────────────┬───────────────────────┤
│              │  [Editor] [Whiteboard]   │                       │
│ VIDEO PANEL  │  toggle in toolbar       │  CHAT PANEL           │
│              │                          │                       │
│ [Cam Tile 1] │  MONACO EDITOR           │  Messages             │
│ [Cam Tile 2] │    ── or ──              │  🤖 AI Interviewer    │
│              │  EXCALIDRAW WHITEBOARD   │  panel (NEW)          │
│  🎤 📷 🔴   │                          │  Input+Send           │
│              │  Output Console          │  Typing...            │
│  [AI Mode ●] │                          │                       │
│  (interviewer│  📝 Problem Statement    │                       │
│   only)      │  (collapsible)           │                       │
└──────────────┴──────────────────────────┴───────────────────────┘

Proctoring Warning Bar (candidate only — appears on violation):
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  Warning 1/3 — Tab switch detected. Stay focused.            │
└─────────────────────────────────────────────────────────────────┘

Private Notes Drawer (candidate only — slides in from right):
┌───────────────────┐
│ 📝 My Notes       │
│ (not visible to   │
│  interviewer)     │
│                   │
│ [textarea]        │
└───────────────────┘
```

### Video Controls (Simplified — No Screen Share)
```
🎤 Mic on/off
📷 Camera on/off
🔴 End call

Intentionally minimal — interviewer sees everything via editor + whiteboard
```

---

## 🏗️ BUILD STEPS — STRICT ORDER

```
STEP 1  — Architecture deep-dive + new modules planning
STEP 2  — TypeScript interfaces + Mongoose schemas (include all new models)
STEP 3  — Backend: Express setup, middleware, DB
STEP 4  — Auth: JWT dual-token, bcrypt, RBAC, Google OAuth
          + Email verification flow
          + Forgot/Reset password
STEP 5  — REST APIs: Rooms, Users, Feedback, Whiteboard, Proctoring
STEP 6  — Socket.IO: code sync, chat, whiteboard, proctoring events
STEP 7  — WebRTC: offer/answer/ICE with TURN (video + audio only)
STEP 8  — Code collaboration: Y.js CRDT + Monaco + cursor presence
STEP 9  — Whiteboard: Excalidraw + Socket.IO sync + snapshot save
STEP 10 — Proctoring: fullscreen, tab-switch, paste prevention, typing pattern, 3-strike system
STEP 11 — Judge0 code execution + AI features (Groq — hints + review)
STEP 12 — Email service (all 10 email types)
          + Post-interview thank you flow
          + Reminder cron job (30 min before)
STEP 13 — Question Bank: schema + seed script (50+ questions) + CRUD API (NEW)
STEP 14 — Interview Timer: Socket.IO timer events + frontend countdown (NEW)
STEP 15 — Session Replay: ReplayFrame recording during session + replay API (NEW)
STEP 16 — AI Interviewer Mode: GPT follow-up question generation + Socket events (NEW)
STEP 17 — AI Post-Interview Report: GPT report generation + cron (15min after session) (NEW)
STEP 18 — Frontend: Vite setup, routing, Zustand, React Query
STEP 19 — Frontend: Auth pages
          (Login, Register, Verify Email, Forgot Password, Reset Password)
STEP 20 — Frontend: Interviewer Dashboard (with Replay + Question Bank links)
STEP 21 — Frontend: Candidate Dashboard (with Report + Replay links)
STEP 22 — Frontend: Interview Room (Editor+Whiteboard toggle, Video, Chat, Proctoring,
          Timer, AI Interviewer panel, Private Notes, Problem Statement panel) (UPDATED)
STEP 23 — Frontend: Interviewer proctoring live panel + violation log
STEP 24 — Frontend: Post-interview Thank You page (candidate)
STEP 25 — Frontend: Feedback form + violation report
STEP 26 — Frontend: Question Bank page (interviewer — browse, filter, push to room) (NEW)
STEP 27 — Frontend: Session Replay page (NEW)
STEP 28 — Frontend: AI Performance Report page (NEW)
STEP 29 — Frontend: Profile pages (candidate + interviewer)
STEP 30 — Admin dashboard
STEP 31 — Docker + GitHub Actions CI/CD
STEP 32 — Testing + README + deployment + final polish
```

---

## 🛑 STRICT ENGINEERING RULES

- NO dummy data, NO placeholder functions
- TypeScript everywhere — no `any` without justification
- Every component reusable and modular
- Error handling mandatory on every async function
- Winston structured logging — not console.log
- Consistent API response: `{ success, data, message, error }`
- Database queries indexed
- Security not optional — sanitize, validate, never trust client
- Proctoring logic isolated in `useProctor.ts` hook — not scattered
- Replay logic isolated in `useReplay.ts` hook — not scattered (NEW)
- AI Interviewer logic isolated in `useAIInterviewer.ts` hook — not scattered (NEW)
- Separation of concerns — controllers → services → models
- Commit-ready from day one
- Question bank seeded via script — never hardcoded in app logic (NEW)
- AI Report generation is async — never blocks session end flow (NEW)

---

## ✅ FINAL DELIVERABLES CHECKLIST

### Auth & Email
- [ ] Register with email verification
- [ ] Resend verification email
- [ ] Login blocks unverified accounts
- [ ] Forgot password flow
- [ ] Reset password flow
- [ ] Google OAuth
- [ ] Welcome email after verification

### Interview Flow
- [ ] Schedule interview + invite email (candidate)
- [ ] Interview scheduled email (interviewer)
- [ ] Reminder email 30 min before (both, cron)
- [ ] Join room via secure invite link
- [ ] Real-time code collaboration (Y.js)
- [ ] Collaborative whiteboard (Excalidraw)
- [ ] WebRTC video + audio
- [ ] In-room chat
- [ ] Proctoring (fullscreen + tab + paste + typing)
- [ ] 3-strike violation system
- [ ] Code execution (Judge0)
- [ ] AI hints (Groq)
- [ ] Interview Timer — synced countdown (NEW)
- [ ] Question Bank — browse + push to room (NEW)
- [ ] AI Interviewer Mode — GPT follow-up questions (NEW)
- [ ] Private candidate notes scratchpad (NEW)

### Post-Interview
- [ ] Thank you page (candidate)
- [ ] Thank you email (candidate, auto)
- [ ] Session summary email (interviewer, auto)
- [ ] Feedback form (interviewer)
- [ ] Feedback email (candidate, if shared)
- [ ] Violation report in feedback
- [ ] Share on LinkedIn button (thank you page)
- [ ] Session Replay — full code + whiteboard playback (NEW)
- [ ] AI Performance Report — GPT analysis (NEW)
- [ ] AI Report email to candidate (NEW)
- [ ] Code Diff Viewer — compare snapshots (NEW)

### Production
- [ ] Complete TypeScript frontend (React + Vite)
- [ ] Complete TypeScript backend (Node.js + Express)
- [ ] Real WebRTC video — tested on 2 browsers
- [ ] Docker Compose
- [ ] GitHub Actions CI/CD
- [ ] Swagger API docs
- [ ] README with architecture diagrams
- [ ] .env.example
- [ ] Unit + Integration tests
- [ ] Live demo URL

---

## 📝 RESUME BULLETS (Ready to use)

```latex
\resumeItem{Built \textbf{production-grade interview platform} with
real-time collaborative code editor, WebRTC P2P video, shared
whiteboard, and AI-powered hints — similar to CoderPad + HackerRank.}

\resumeItem{Implemented \textbf{Y.js CRDT} for conflict-free collaborative
editing with live cursor presence — same technology used by Notion and Figma.}

\resumeItem{Integrated \textbf{shared whiteboard} (Excalidraw) synced in
real-time via Socket.IO — candidates draw system designs during interviews.}

\resumeItem{Built browser-based \textbf{proctoring system} with fullscreen
enforcement, tab-switch detection, paste prevention, and typing pattern
analysis — 3-strike system alerts interviewer and auto-ends session.}

\resumeItem{Built \textbf{complete email notification system} with 10
transactional email types — verification, interview invites, reminders,
post-interview thank you, and feedback delivery using SendGrid.}

\resumeItem{Designed \textbf{role-based JWT authentication} with email
verification, dual-token strategy (15min access + 7day refresh),
and Google OAuth integration.}

\resumeItem{Implemented \textbf{Session Replay} — full code and whiteboard
playback with scrubbing timeline, allowing interviewers to rewatch
candidate's problem-solving evolution post-interview.}

\resumeItem{Built \textbf{AI Interviewer Mode} using GPT-4o — analyzes
candidate's code in real-time and generates contextual follow-up questions
for the interviewer, simulating expert pair-programming evaluation.}

\resumeItem{Developed \textbf{AI Performance Report} system — GPT generates
structured post-interview analysis (code quality, complexity analysis,
strengths, improvement areas) delivered via email 15 minutes after session.}

\resumeItem{Built \textbf{curated question bank} with 50+ DSA and System
Design problems — interviewers browse, filter by difficulty/tag, and push
questions directly to candidate's editor with starter code auto-fill.}
```

---

> **Now begin. Start with STEP 1 — Architecture deep-dive.**
> Explain every design decision. Draw out the data flow. List every trade-off.
> Build something a hiring manager at Google would open-source. 🚀
