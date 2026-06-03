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

**Pro-level interviews. Zero tab switchingass.**

---

## ✨ Features

| Feature | What it does |
|---------|-------------|
| 📹 **WebRTC P2P Video Calling** | High-quality video + audio with zero lag — no Zoom, no third-party dependency |
| 💻 **Real-Time Collaborative Editor** | Monaco Editor + Y.js CRDT — live cursors, conflict-free editing, instant sync |
| 🎨 **Shared Whiteboard** | Excalidraw integration — draw system designs, flowcharts, and diagrams together in real-time |
| ⚡ **Instant Code Execution** | Judge0 integration — run code in 7+ languages (Python, Java, C++, JavaScript, etc.) with live output |
| 🤖 **AI Hints (3 Levels)** | Candidate can request smart hints without spoiling the solution — powered by Groq / OpenAI |
| 💬 **Real-Time Chat** | Built-in chat inside every interview room — no external tool needed |
| 📝 **Structured Feedback** | Interviewer submits detailed feedback at the end. Candidate gets notified and can view it instantly |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js + javascript + Tailwind CSS |
| **Editor** | Monaco Editor + Y.js CRDT |
| **Whiteboard** | Excalidraw |
| **Video & Real-time** | WebRTC + Socket.IO |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB |
| **Code Execution** | Judge0 API |
| **AI** | Groq / OpenAI |
| **Auth** | JWT |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Judge0 API key *(optional for code execution)*
- Groq or OpenAI API key *(optional for AI hints)*

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/bharatdhuva/Interview-OS.git
cd Interview-OS
```

**2. Backend setup**

```bash
cd server
npm install
cp .env.example .env
# Add your keys in .env
npm run dev
```

**3. Frontend setup** *(open a new terminal)*

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — create a room and start interviewing!

---

## 🔑 Environment Variables

```env
# MongoDB
MONGO_URI=

# Auth
JWT_SECRET=

# Code Execution
JUDGE0_API_URL=

# AI Hints
GROQ_API_KEY=          # or OPENAI_API_KEY
```

---

## 📁 Project Structure

```
Interview-OS/
├── server/           # Node.js + Express + Socket.IO + MongoDB
├── client/           # React + TypeScript + Tailwind CSS
├── .env.example
├── .gitignore
└── README.md
```

---

## 🗺️ Roadmap

- [x] WebRTC P2P Video Calling
- [x] Y.js Real-time Collaborative Editor
- [x] Excalidraw Shared Whiteboard
- [x] Judge0 Code Execution
- [x] AI Hints System (3 Levels)
- [x] Real-time Chat + Structured Feedback
- [ ] Interview Recording
- [ ] Code Snapshot & Diff View
- [ ] Admin Dashboard
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
