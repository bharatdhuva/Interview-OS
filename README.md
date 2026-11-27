<div align="center">

<h1>InterviewOS 🚀</h1>
<h3>AI-Powered Real-Time Interview Platform</h3>
<p><em>AI Voice Interviewer on mobile. Live collaborative rooms on desktop. Zero tab switching.</em></p>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-interviewos--bharatdhuva.vercel.app-6366f1?style=flat-square&logo=vercel)](https://interviewos-bharatdhuva.vercel.app/)
[![GitHub stars](https://img.shields.io/github/stars/bharatdhuva/Interview-OS?style=flat-square&color=6366f1)](https://github.com/bharatdhuva/Interview-OS/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square&color=6366f1)](LICENSE)
[![Status](https://img.shields.io/badge/status-Active-brightgreen?style=flat-square)](https://github.com/bharatdhuva/Interview-OS)
[![Made with](https://img.shields.io/badge/Made%20with-React%20%2B%20WebRTC%20%2B%20Gemini-6366f1?style=flat-square)](https://github.com/bharatdhuva/Interview-OS)

</div>

---

## What is InterviewOS?

Traditional technical interviews are painful — Zoom for video, Google Docs for coding, Excalidraw for diagrams, email for feedback. Every tool is disconnected.

**InterviewOS fixes all of that in two ways:**

- 📱 **Mobile** → Instant AI Voice Interviewer. Upload your resume, pick a persona (Technical / HR), and have a real spoken conversation with an AI interviewer powered by Gemini + ElevenLabs. Get a scored evaluation report in seconds.
- 🖥️ **Desktop** → Full live interview room. WebRTC video, collaborative Monaco editor, shared Excalidraw whiteboard, Judge0 code execution, proctoring, session replay, and AI-generated evaluation report — all in one tab.

**Pro-level interviews. Zero tab switching.**

---

## ✨ Feature Overview

### 🤖 AI Voice Interviewer *(Mobile-First)*

| Feature | Details |
|---------|---------|
| 🎙️ **Voice Conversation** | Real spoken interviews via ElevenLabs TTS (Flash v2.5) + STT (Scribe v1) |
| 🧠 **Multi-Provider LLM** | Gemini (primary) → Groq (fallback) → OpenAI (optional), Zod-validated structured output with auto-repair |
| 👤 **AI Personas** | **Alex** (Technical — STAR framework, DSA, system design) · **Maya** (HR/Behavioral) |
| 📄 **Smart Resume Parsing** | PDF upload with strict validation: 160+ chars, 30+ words, 2-of-3 signal categories (contact info, section keywords, qualification terms / tech skills) |
| 📝 **Live Typewriter Captions** | Captions sync to ElevenLabs audio `currentTime/duration` playback progress in real time |
| 📊 **4-Dimension Evaluation Report** | Communication · Role Knowledge · Problem Solving · Confidence & Clarity — scored 1–5 with an SVG radial gauge + radar chart |
| 🛡️ **Prompt Injection Guardrails** | `sanitizeUntrustedTagContent`, `wrapUntrusted`, `detectInjectionAttempts`, `checkOutputForLeaks`, anomaly checks on all LLM I/O |
| 🖨️ **Printable Report** | One-click print of the full evaluation with dimension breakdown and transcript accordion |

### 🏠 Live Interview Rooms *(Desktop)*

| Feature | Details |
|---------|---------|
| 📹 **WebRTC P2P Video** | High-quality peer-to-peer video + audio — no Zoom, no third-party dependency |
| 💻 **Collaborative Code Editor** | Monaco Editor + Y.js CRDT + Socket.IO real-time sync — live cursors, instant code sharing |
| 🎨 **Shared Whiteboard** | Excalidraw with E2E encrypted Socket.IO sync — draw system designs and flowcharts together live |
| ⚡ **Instant Code Execution** | Judge0 sandboxed execution in 7+ languages (Python, Java, C++, JavaScript…) with stdin and live output |
| 💬 **In-Room Chat** | Built-in real-time chat — no external tool needed |
| 🔒 **Custom Proctoring** | Tab-switch detection, paste prevention, fullscreen monitoring, 3-strike auto-termination — zero third-party SDK |
| ⏪ **Session Replay** | Time-travel replay of code and whiteboard checkpoints with `?t=ms` timestamps for post-interview review |
| 🤖 **AI Evaluation Pipeline** | Evidence-grounded 6-dimension scoring with context compression, Excalidraw snapshots, replay timeline, and anomaly guardrails |
| 📝 **Structured Feedback** | Interviewer submits detailed feedback; candidate gets notified and views it instantly |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + JavaScript + Tailwind CSS + Framer Motion |
| **Editor** | Monaco Editor + Y.js CRDT + Socket.IO real-time sync |
| **Whiteboard** | Excalidraw (E2E encrypted, Socket.IO sync) |
| **Video & Real-time** | WebRTC + Socket.IO |
| **Code Execution** | Judge0 API (sandboxed, 7+ languages) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **AI — LLM** | Gemini 2.0 Flash (primary) · Groq LLaMA 3.3-70B (fallback) · OpenAI (optional) |
| **AI — Voice** | ElevenLabs TTS Flash v2.5 + STT Scribe v1 |
| **AI — Validation** | Zod structured output schema + auto-repair retry + cross-provider fallback |
| **Auth** | JWT (access + refresh token rotation) + GitHub OAuth |
| **Performance** | Route-level lazy loading, Vite vendor chunk splitting, `preconnect` + `dns-prefetch` |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React 18)                     │
│  Mobile (<768px)                     Desktop (≥768px)            │
│  └─ AI Voice Interviewer             └─ Live Interview Room       │
│     ├─ Resume upload + validation       ├─ WebRTC video           │
│     ├─ ElevenLabs TTS/STT              ├─ Monaco + Y.js editor    │
│     ├─ Typewriter captions             ├─ Excalidraw whiteboard   │
│     └─ Radar chart eval report         ├─ Judge0 execution        │
│                                        ├─ Proctoring system       │
│                                        └─ Session replay          │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST + Socket.IO
┌────────────────────────▼────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    AI Services Layer                      │   │
│  │  llmClient.js ──► Gemini (default) → Groq → OpenAI       │   │
│  │  interviewer.js ── extractResumeData, validateResume      │   │
│  │  evaluator.js ─── 6-dimension evidence-grounded scoring   │   │
│  │  voice.js ──────── ElevenLabs TTS (Flash) + STT (Scribe) │   │
│  │  guardrails/ ───── injection detection, leak checks       │   │
│  │  contextAssembler.js ─ code diffs, Judge0, Excalidraw    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  Socket.IO rooms · JWT + RBAC · MongoDB · AiCallLog observability│
└─────────────────────────────────────────────────────────────────┘
```

### LLM Orchestration
`llmClient.js` wraps all three providers behind a single interface. Every response is parsed against a **Zod schema** — if the first parse fails, it attempts a **repair prompt** before falling back to the next provider. All calls are logged to `AiCallLog` for observability.

### AI Evaluation Pipeline
After an interview session ends:
1. `contextAssembler.js` gathers code diffs with `?t=ms` replay timestamps, Judge0 run results, Excalidraw canvas snapshots, and replay timeline events
2. `compression/index.js` summarises the whiteboard and formats the replay timeline to fit the LLM context window
3. `evaluator.js` scores 6 dimensions with **evidence chips** (timestamped quotes from the actual session)
4. `guardrails/index.js` checks for injection attempts in untrusted content and anomalies in the output scores before the report is returned

---

## 📱 Mobile Experience

On screens narrower than 768 px, InterviewOS is a **candidate-only AI Voice Interviewer**:

- Onboarding auto-detects mobile and skips the role selector — users are registered as candidates immediately
- The dashboard shows an AI Interview CTA hero with a stats strip
- Clicking *Start AI Interview* opens the voice interview room:
  - Upload your resume PDF → validated for content (not just file type)
  - Choose a persona: **Alex** (Technical, Liam voice) or **Maya** (HR, Sarah voice)
  - Tap the mic to speak; ElevenLabs speaks back
  - Typewriter captions track audio playback in real time
  - After the session, an SVG radial score gauge + 4-axis radar chart evaluation is shown

Live rooms, collaborative code, and whiteboard require a desktop browser.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Auth
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# AI — LLM (Gemini is primary)
AI_PROVIDER=gemini
AI_MODEL=gemini-2.0-flash
AI_FALLBACK_PROVIDER=groq
GEMINI_API_KEY=          # Required — primary LLM
GROQ_API_KEY=            # Required — fallback LLM
OPENAI_API_KEY=          # Optional — tertiary fallback

# AI — Voice
ELEVENLABS_API_KEY=      # Required for AI Voice Interviewer

# Code Execution
JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_API_KEY=          # Only for RapidAPI / secured Judge0 deployments

# Frontend URL
CLIENT_URL=http://localhost:8080
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API key (get one free at [aistudio.google.com](https://aistudio.google.com))
- ElevenLabs API key (for voice)
- Judge0 API key *(optional — code execution)*

### Installation

```bash
# 1. Clone
git clone https://github.com/bharatdhuva/Interview-OS.git
cd Interview-OS

# 2. Backend
cd backend
npm install
cp .env.example .env
# Fill in your keys in .env
npm run dev

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) — sign up, upload your resume, and start interviewing!

---

## 📁 Project Structure

```
Interview-OS/
├── backend/
│   └── src/
│       ├── controllers/        # Route handlers (rooms, auth, AI interview)
│       ├── models/             # Mongoose schemas
│       ├── routes/             # Express routers
│       ├── sockets/            # Socket.IO event handlers
│       ├── middleware/         # Auth (JWT + RBAC), validation, rate-limiting
│       ├── services/
│       │   └── ai/
│       │       ├── llmClient.js          # Multi-provider LLM + Zod + repair + fallback
│       │       ├── interviewer.js        # Resume parsing + validation
│       │       ├── evaluator.js          # 6-dimension evidence-grounded scoring
│       │       ├── voice.js              # ElevenLabs TTS (Flash v2.5) + STT (Scribe v1)
│       │       ├── contextAssembler.js   # Code diffs, Judge0, Excalidraw, replay
│       │       ├── guardrails/           # Injection detection, leak checks, anomaly guards
│       │       ├── compression/          # Whiteboard summary, timeline formatter
│       │       └── prompts/              # Persona prompt templates (Alex / Maya)
│       └── utils/              # JWT, email, logging, AiCallLog
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── ai/             # AiInterviewRoom (voice + eval report)
│       │   ├── auth/           # Login, Register, Onboarding (mobile auto-candidate)
│       │   ├── dashboard/      # CandidateDashboard, InterviewerDashboard
│       │   ├── room/           # InterviewRoom (WebRTC + editor + whiteboard)
│       │   └── feedback/       # FeedbackPage
│       ├── components/
│       │   ├── ai/             # AiInterviewerHub (file validation, session control)
│       │   ├── layout/         # AuthNavbar (role-aware logo routing)
│       │   └── ui/             # Toast (dark, always-visible, mobile safe-area)
│       ├── hooks/
│       │   ├── useVoiceInterview.js  # speechMode, speechProgress, typewriter sync
│       │   └── useProctoring.js      # Tab-switch detection, 3-strike auto-terminate
│       ├── store/              # Zustand auth store
│       └── lib/               # API client, crypto, validations
├── .gitignore
└── README.md
```

---

## 🗺️ What's Shipped

- [x] **WebRTC P2P Video** — high-quality peer-to-peer video + audio
- [x] **Monaco Editor + Y.js CRDT** — real-time collaborative code editing with conflict resolution
- [x] **Excalidraw Whiteboard** — E2E encrypted, Socket.IO synced shared canvas
- [x] **Judge0 Code Execution** — sandboxed, 7+ languages, custom stdin, live output
- [x] **Custom Proctoring** — tab-switch detection, paste prevention, fullscreen, 3-strike auto-end (no third-party SDK)
- [x] **Session Replay** — time-travel playback with `?t=ms` timestamped evidence chips
- [x] **In-Room Chat + Structured Feedback** — built-in chat and end-of-session feedback for candidates
- [x] **Multi-Provider LLM Client** — Gemini → Groq → OpenAI with Zod-validated structured output, auto-repair, and cross-provider fallback
- [x] **Evidence-Grounded AI Evaluation** — 6-dimension scoring (communication, role knowledge, problem solving, confidence, code quality, whiteboard) with context compression and guardrail checks
- [x] **AI Voice Interviewer** — ElevenLabs TTS/STT, two AI personas (Alex / Maya), live typewriter captions synced to audio playback
- [x] **Smart Resume Validation** — strict PDF content validation (not just file type): 160+ chars, 30+ words, 2-of-3 signal categories required
- [x] **4-Dimension Evaluation Report** — SVG radial score gauge, radar chart, printable with transcript accordion
- [x] **Mobile-First Candidate Flow** — auto-onboarding, AI interview CTA dashboard, `100dvh` layout, GPU-composited orb animations, fixed voice dock
- [x] **Performance** — route-level lazy loading, Vite vendor chunk splitting (react, motion, icons, charts, socket, monaco, excalidraw), `preconnect` + `dns-prefetch`
- [x] **Prompt Injection Guardrails** — sanitize/wrap untrusted content, detect injection attempts, leak checks on all LLM output

---

## 💡 Why I Built This

I was tired of messy interviews where everyone kept switching tabs and tools.

A good technical interview should feel smooth and focused on problem-solving — not on managing 4 different apps at once.

So I built InterviewOS — a complete platform that makes interviews professional, collaborative, and actually enjoyable for both sides. And then went further: an AI voice interviewer you can practice with on your phone, any time, with no one else needed.

---

<div align="center">

Built with ❤️ by **[Bharat Dhuva](https://github.com/bharatdhuva)**

Third-year Computer Science Student · MS University Baroda, Gujarat

[![GitHub](https://img.shields.io/badge/GitHub-bharatdhuva-181717?style=flat-square&logo=github)](https://github.com/bharatdhuva)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-bharatdhuva27-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/bharatdhuva27)

---

*If InterviewOS helped you or you liked it — drop a ⭐ It means a lot.*

</div>
