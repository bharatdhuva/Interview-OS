<div align="center">

<h1>InterviewOS 🚀</h1>
<h3>Real-Time Collaborative Interview Platform</h3>
<p><em>Stop switching between Zoom, Google Docs, and email. Everything in one tab.</em></p>

[![GitHub stars](https://img.shields.io/github/stars/bharatdhuva/Interview-OS?style=flat-square&color=6366f1)](https://github.com/bharatdhuva/Interview-OS/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square&color=6366f1)](LICENSE)
[![Status](https://img.shields.io/badge/status-Active-brightgreen?style=flat-square)](https://github.com/bharatdhuva/Interview-OS)
[![Made with](https://img.shields.io/badge/Made%20with-React%20%2B%20WebRTC-6366f1?style=flat-square)](https://github.com/bharatdhuva/Interview-OS)

</div>

---

## What is InterviewOS?

Traditional technical interviews are painful.

You juggle Zoom for video, Google Docs for coding, Excalidraw for diagrams, and email for feedback. Every tool is disconnected. Every switch breaks your focus.

**InterviewOS fixes all of that.**

One single link → real-time video call starts automatically. Both interviewer and candidate code together live, draw on a shared whiteboard, run code instantly, and chat — all inside the same room.

**Pro-level interviews. Zero tab switching.**

---

## ✨ Features

| Feature | What it does |
|---------|-------------|
| 📹 **WebRTC P2P Video Calling** | High-quality video + audio with zero lag — no Zoom, no third-party dependency |
| 💻 **Real-Time Collaborative Editor** | Monaco Editor with Socket.IO real-time sync — live cursors, instant code sharing |
| 🎨 **Shared Whiteboard** | Excalidraw integration with E2E encryption — draw system designs, flowcharts, and diagrams together in real-time |
| ⚡ **Instant Code Execution** | Judge0 integration — run code in 7+ languages (Python, Java, C++, JavaScript, etc.) with live output and stdin support |
| 💬 **Real-Time Chat** | Built-in chat inside every interview room — no external tool needed |
| 📝 **Structured Feedback** | Interviewer submits detailed feedback at the end. Candidate gets notified and can view it instantly |
| 🔒 **Proctoring System** | Tab-switch detection, fullscreen monitoring, 3-strike auto-termination |
| ⏪ **Session Replay** | Time-travel replay of code and whiteboard activity for post-interview review |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js + javascript + Tailwind CSS |
| **Editor** | Monaco Editor + Socket.IO real-time sync |
| **Whiteboard** | Excalidraw (E2E encrypted) |
| **Video & Real-time** | WebRTC + Socket.IO |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB |
| **Code Execution** | Judge0 API |
| **AI** | Groq / OpenAI |
| **Auth** | JWT (access + refresh token rotation) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Judge0 API key *(optional for code execution)*

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/bharatdhuva/Interview-OS.git
cd Interview-OS
```

**2. Backend setup**

```bash
cd backend
npm install
cp .env.example .env
# Add your keys in .env
npm run dev
```

**3. Frontend setup** *(open a new terminal)*

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) — create a room and start interviewing!

---

## 🔑 Environment Variables

```env
# MongoDB
MONGO_URI=

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=

# Code Execution
JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_API_KEY= # only required for RapidAPI/custom secured Judge0 deployments

# Client URL (frontend)
CLIENT_URL=http://localhost:8080
```

---

## 📁 Project Structure

```
Interview-OS/
├── backend/          # Node.js + Express + Socket.IO + MongoDB
│   └── src/
│       ├── controllers/   # Route handlers
│       ├── models/        # Mongoose schemas
│       ├── routes/        # Express routers
│       ├── sockets/       # Socket.IO event handlers
│       ├── middleware/    # Auth, validation, rate-limiting
│       └── utils/         # JWT, email, logging
├── frontend/         # React + JavaScript + Tailwind CSS
│   └── src/
│       ├── pages/         # Route pages (auth, dashboard, room, feedback)
│       ├── components/    # Reusable UI components
│       ├── hooks/         # Custom React hooks (proctoring, toast)
│       ├── store/         # Zustand auth store
│       └── lib/           # API client, crypto, validations
├── .gitignore
└── README.md
```

---

## 🗺️ Roadmap & Future Scope

### Completed Core Features:
- [x] **WebRTC P2P Video Calling**: High-quality P2P video and audio stream communication without Zoom dependencies.
- [x] **Real-time Collaborative Editor**: Monaco Editor integrated with Socket.IO for real-time cursor sync.
- [x] **Excalidraw Shared Whiteboard**: E2E encrypted canvas to draw system designs and flowcharts collaboratively.
- [x] **Judge0 Code Execution**: Run code in 7+ languages (JS, Python, C++, Java, etc.) with custom stdin and live console logs.
- [x] **Anti-Cheat Proctoring**: Tab-switch tracking, browser visibility checks, and fullscreen enforcement with a 3-strike auto-end system.
- [x] **Session Replay**: Time-travel playback of code changes and whiteboard checkpoints for post-interview reviews.
- [x] **Real-time Chat & Feedback**: Built-in chat inside interview rooms and structured feedback summaries.

### 🔮 Future Scaling & Architectural Scope:
- [ ] **Horizontal WebSocket Scaling**: Integrate a **Redis Pub/Sub adapter** to allow Socket.IO rooms to communicate across multiple instances behind a load balancer.
- [ ] **AI-Powered Evaluation**: Build an LLM evaluation agent (OpenAI/Groq) that analyzes final code snapshots, chat logs, and compiles structural reports (efficiency, Big O complexity, communication style).
- [ ] **CRDT Collaboration (Yjs)**: Implement Conflict-free Replicated Data Types (CRDTs) to handle high-frequency simultaneous typing and conflict resolution in the Monaco Editor.
- [ ] **System Design Templates**: Add pre-built drag-and-drop structural components (databases, servers, cache, queues) to the Excalidraw canvas.
- [ ] **Speech-to-Text Transcription**: Integrate the browser's native Web Speech API to auto-transcribe calls and build searchable meeting transcripts.

---

## 💡 Why I Built This

I was tired of messy interviews where everyone kept switching tabs and tools.

A good technical interview should feel smooth and focused on problem-solving — not on managing 4 different apps at once.

So I built InterviewOS — a complete real-time platform that makes technical interviews professional, collaborative, and actually enjoyable for both sides.

---

<div align="center">

Built with ❤️ by **[Bharat Dhuva](https://github.com/bharatdhuva)**

Third-year Computer Science Student · MS University Baroda, Gujarat

[![GitHub](https://img.shields.io/badge/GitHub-bharatdhuva-181717?style=flat-square&logo=github)](https://github.com/bharatdhuva)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-bharatdhuva27-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/bharatdhuva27)

---

*If InterviewOS helped you or you liked it — drop a ⭐ It means a lot.*

</div>
