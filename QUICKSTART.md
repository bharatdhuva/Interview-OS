# 🚀 Quick Start Guide - InterviewOS

Get InterviewOS running locally in **5 minutes**.

---

## Prerequisites

- **Node.js** v18+ (https://nodejs.org/)
- **Docker** (optional, for MongoDB & Redis)
- **Git** (for cloning)

---

## Option A: Docker Compose (Easiest) ⭐

### 1. Clone & Setup
```bash
git clone https://github.com/yourusername/Interview-OS.git
cd Interview-OS
cp .env.example .env
```

### 2. Start All Services
```bash
# Starts MongoDB, Redis, Backend, Frontend
docker-compose up -d
```

### 3. Verify Services
```bash
# Backend API
curl http://localhost:8090/health
# Should return: { "status": "ok" }

# Frontend
open http://localhost:8080
```

---

## Option B: Local Installation

### 1. Setup MongoDB

**On macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**On Windows:**
- Download: https://www.mongodb.com/try/download/community
- Run installer, accept defaults
- MongoDB will start automatically

**Using MongoDB Atlas (Cloud):**
- Go to https://www.mongodb.com/cloud/atlas
- Create free cluster
- Copy connection string to `.env` as `MONGODB_URI`

### 2. Setup Backend
```bash
cd server
npm install
npm run dev
```
Should output: `Server running on port 8090`

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Should output: `VITE v... ready in XXX ms`

### 4. Open Browser
```bash
# Frontend
http://localhost:8080

# Backend API
http://localhost:8090/api/v1/auth/me  # Should return 401 (no token)
```

---

## Configuration

### Email Setup (Optional for Local Testing)

#### Option 1: Ethereal Test Email (Default - No Setup)
```bash
# In development mode, emails are logged to console
# Check terminal output for verification links
```

#### Option 2: SendGrid (Production)
```bash
# 1. Get API key from https://sendgrid.com
# 2. Add to .env:
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=test@example.com
# 3. Restart backend
```

### Environment Variables

Copy important ones from `.env.example` to `.env`:

```bash
# REQUIRED
NODE_ENV=development
PORT=8090
CLIENT_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/interviewos

# SECRETS (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_secret_here
INVITE_TOKEN_SECRET=your_secret_here

# OPTIONAL (leave blank for demo)
GOOGLE_CLIENT_ID=
SENDGRID_API_KEY=
STRIPE_SECRET_KEY=
```

---

## Testing the Auth System

### 1. Register
```bash
curl -X POST http://localhost:8090/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!",
    "role": "candidate"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "candidate",
    "accessToken": "eyJhbGc..."
  }
}
```

### 2. Get Verification Token

In development, the verification email is logged to the backend console output:

```
POST response for verification email
URL: http://localhost:8080/verify-email?email=test@example.com&token=abc123def456...
```

Copy the `token` value.

### 3. Verify Email
```bash
curl -X POST http://localhost:8090/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "token": "PASTE_TOKEN_HERE"
  }'
```

### 4. Login
```bash
curl -X POST http://localhost:8090/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### 5. Get Current User (Protected)
```bash
curl http://localhost:8090/api/v1/auth/me \
  -H "Authorization: Bearer PASTE_ACCESS_TOKEN_HERE"
```

---

## Common Commands

### Backend
```bash
# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Run production build
npm start

# Check linting
npm run lint
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint
```

### Docker
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild images
docker-compose build
```

---

## Troubleshooting

### "Connection refused on 27017"
MongoDB is not running.
```bash
# Start MongoDB
brew services start mongodb-community  # macOS
# OR use Docker
docker-compose up -d mongo
```

### "Cannot find module 'express'"
Dependencies not installed.
```bash
cd server
npm install
```

### "CORS error from frontend"
Check `CLIENT_URL` in backend `.env` matches your frontend URL.
```bash
# Should be:
CLIENT_URL=http://localhost:8080
```

### "Email not sent"
```bash
# 1. Check backend console for email logs (development mode)
# 2. If using SendGrid, check .env has valid API key
# 3. Verify FROM_EMAIL is configured
```

### Port already in use
```bash
# Find process using port 8090
lsof -i :8090

# Kill it (macOS/Linux)
kill -9 <PID>

# Or use different port
PORT=8091 npm run dev
```

---

## Next Steps

1. ✅ Register a test account
2. ✅ Verify email
3. ✅ Test login/logout
4. ✅ Test password reset
5. ⏭️ Build interview room component
6. ⏭️ Test real-time features
7. ⏭️ Deploy to Render + Vercel

See `IMPLEMENTATION_SUMMARY.md` for phase 2 roadmap.

---

## Help

- **GitHub Issues:** Report bugs on GitHub
- **Docs:** Check `DEPLOYMENT.md` for deployment help
- **Logs:** Always check backend/frontend console for errors

---

Happy coding! 🎉
