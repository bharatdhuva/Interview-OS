# InterviewOS

A web-based interview platform where interviewers and candidates can code together, video call, draw on a shared whiteboard, and chat — all in one place. No more switching between Zoom, Google Docs, and email during interviews.

---

## What it does

- **Video calling** — WebRTC based, works peer-to-peer
- **Collaborative code editor** — both people can type at the same time, live cursors visible
- **Shared whiteboard** — draw diagrams, system designs, flowcharts together in real-time — built with Excalidraw
- **Code execution** — run code directly in the browser (JS, Python, Java, C++, and more)
- **AI hints** — candidate can ask for hints, comes in 3 levels so it doesn't just give the answer
- **Chat** — simple real-time chat inside the room
- **Feedback** — interviewer submits structured feedback after the interview, candidate can view it

---

## Tech used

**Frontend** — React, TypeScript, Tailwind CSS, Monaco Editor, Excalidraw, Socket.IO, WebRTC

**Backend** — Node.js, Express, MongoDB, Socket.IO, JWT auth

**Others** — Judge0 (code execution), Y.js (real-time collaboration), Groq/OpenAI (AI hints)

---

## Run locally

```bash
git clone https://github.com/bharatdhuva/Interview-OS.git
cd Interview-OS

# Backend
cd server
npm install
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in your keys before running.

---

## How an interview works

1. Interviewer creates a room and gets an invite link
2. Link is sent to the candidate
3. Both join — video call starts automatically
4. Candidate can code in the editor or explain approach on the whiteboard
5. Interviewer watches everything live — code + whiteboard both
6. After interview, interviewer submits feedback
7. Candidate gets notified and can view feedback

---

## Coming Soon

- Interview recording (save to Cloudinary)
- Code snapshot diff view
- Admin dashboard

---

## Author

Bharat Dhuva — [LinkedIn](https://linkedin.com/in/bharatdhuva27) · [GitHub](https://github.com/bharatdhuva)
