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
| **Payments** | Stripe (subscriptions + billing portal) |

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

### Quick Local Run (verified steps)

1. Backend (runs on port 8090):

```bash
cd backend
npm install
# copy .env.example to .env and fill values as needed
cp .env.example .env
npm run dev
```

2. Frontend (runs on port 8080):

```bash
cd frontend
npm install
npm run dev
```

Notes:
- Do not commit your `.env` — it is ignored by the repo. I created a local `.env` to start the backend.
- To have commits counted for your GitHub account, ensure `git config user.email` matches an email on your GitHub account, then commit and push to the repository.

---

## 🔑 Environment Variables

```env
# MongoDB
MONGO_URI=

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=

# Code Execution
JUDGE0_API_URL=
JUDGE0_API_KEY=

# Client URL (frontend)
CLIENT_URL=http://localhost:8080

# Stripe (optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
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

## 🗺️ Roadmap

- [x] WebRTC P2P Video Calling
- [x] Real-time Collaborative Editor (Monaco + Socket.IO)
- [x] Excalidraw Shared Whiteboard (E2E encrypted)
- [x] Judge0 Code Execution (7 languages + stdin)
- [x] Real-time Chat + Structured Feedback
- [x] Proctoring System (tab-switch, fullscreen, 3-strike auto-end)
- [x] Session Replay (time-travel code + whiteboard playback)
- [x] Code Snapshots (persisted per session)
- [x] Admin Dashboard (users, rooms, analytics, force-end)
- [x] Stripe Billing (subscriptions, webhooks, billing portal)
- [x] Multi-Tenant Organizations (invite, seat limits, role management)
- [ ] Chrome Extension

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
