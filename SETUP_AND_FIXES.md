# Interview OS - Setup & Fixes Guide

## ✅ Fixed Issues

### 1. TypeScript Type Errors (RESOLVED)
**Problem**: Multiple `req.user?.id` optional chaining issues in protected routes causing type errors:
```
src/controllers/user.controller.ts(43,77): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
```

**Root Cause**: The `AuthRequest` interface declared `user?: any` as optional, but protected routes guarantee `req.user` is populated by the auth middleware.

**Files Fixed**:
- ✅ `server/src/controllers/user.controller.ts`
- ✅ `server/src/controllers/room.controller.ts`
- ✅ `server/src/controllers/feedback.controller.ts`
- ✅ `server/src/controllers/execution.controller.ts`

**Solution Applied**: Removed optional chaining (`?.`) from `req.user.id` and `req.user.role` in protected routes since the middleware guarantees these values exist.

**Build Status**: ✅ `npm run build` now passes without TypeScript errors

---

## 📋 Prerequisites to Run the Application

### Backend Requirements:
1. **Node.js** - Already installed (v18+)
2. **MongoDB** - Required (local or cloud)
3. **Redis** - Required (local or cloud)
4. **npm/pnpm** - Already installed

### Frontend Requirements:
1. **Node.js** - Already installed
2. **npm/pnpm** - Already installed

---

## 🚀 Setup Instructions

### Option A: Using Docker (Recommended)
```bash
# Navigate to project root
cd "Interview-OS"

# Start MongoDB and Redis services
docker-compose up -d

# Install and run server
cd server
npm install
npm run dev

# In another terminal, install and run frontend
cd frontend
npm install
npm run dev
```

**Note**: Docker Desktop needs to be installed on your system. If not installed:
- **Windows**: Download from https://www.docker.com/products/docker-desktop

### Option B: Local MongoDB & Redis
```bash
# 1. Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community

# 2. Install Redis locally
# Windows: Use WSL or https://github.com/microsoftarchive/redis/releases

# 3. Start MongoDB
mongod

# 4. Start Redis (in another terminal)
redis-server

# 5. Install dependencies and start server
cd server
npm install
npm run dev

# 6. In another terminal, start frontend
cd frontend
npm install
npm run dev
```

### Option C: MongoDB Atlas (Cloud)
```bash
# 1. Create free account at https://www.mongodb.com/cloud/atlas
# 2. Create a cluster and get connection string
# 3. Update .env file
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/interviewos

# 4. For Redis, use a cloud service like Redis Cloud
REDIS_URL=redis://<username>:<password>@<host>:<port>

# 5. Install and run
cd server
npm install
npm run dev
```

---

## 🔧 Environment Configuration

The `.env` file is already configured for local development:

```ini
# Server
NODE_ENV=development
PORT=8090
CLIENT_URL=http://localhost:8080

# Database
MONGODB_URI=mongodb://localhost:27017/interviewos

# Cache
REDIS_URL=redis://localhost:6379

# JWT Secrets (configured)
JWT_ACCESS_SECRET=interviewos_access_secret_bharat_2026
JWT_REFRESH_SECRET=interviewos_refresh_secret_bharat_2026

# External APIs (need configuration)
JUDGE0_API_KEY=          # Set this for code execution
GOOGLE_CLIENT_ID=        # Set this for Google OAuth
GOOGLE_CLIENT_SECRET=    # Set this for Google OAuth
SENDGRID_API_KEY=        # Set for email notifications
CLOUDINARY_API_*=        # Set for image uploads
GROQ_API_KEY=           # Set for AI features
```

---

## 🏃 Running the Application

### Terminal 1: Start Backend
```bash
cd server
npm run dev
```
Expected output:
```
Server running in development mode on port 8090
MongoDB Connected: localhost
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```
Expected output:
```
VITE v... ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Access the Application
- **Frontend**: http://localhost:8080 or http://localhost:5173
- **Backend API**: http://localhost:8090
- **API Docs**: Check `/api/v1/*` endpoints

---

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
npm test:watch  # Watch mode
```

### Linting
```bash
cd frontend
npm run lint
```

---

## 🐛 Troubleshooting

### "MongoDB connection failed"
- Ensure MongoDB is running (use `mongo` or MongoDB Compass to verify)
- Check connection string in `.env`
- For Docker: Run `docker-compose up -d`

### "Redis connection refused"
- Ensure Redis is running on port 6379
- Check `REDIS_URL` in `.env`

### "Port already in use"
- Backend: Change `PORT` in `.env` (default: 8090)
- Frontend: Vite will use different port automatically

### "TypeScript errors"
- Run `npm run build` to verify compilation
- All errors should now be fixed

### Module not found errors
- Run `npm install` in respective directory
- Clear `node_modules` and reinstall if needed: `rm -rf node_modules && npm install`

---

## 📁 Project Structure

```
Interview-OS/
├── frontend/                 # React/TypeScript UI
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # State management
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities
│   └── package.json
├── server/                  # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── socket/          # Real-time features
│   │   ├── config/          # Configuration
│   │   └── utils/           # Helper functions
│   └── package.json
└── docker-compose.yml       # Docker services (MongoDB, Redis)
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users/profile` - Get current user
- `PATCH /api/v1/users/profile` - Update profile
- `PATCH /api/v1/users/password` - Change password

### Rooms
- `POST /api/v1/rooms` - Create interview room
- `GET /api/v1/rooms` - List user's rooms
- `GET /api/v1/rooms/:roomId` - Get room details
- `POST /api/v1/rooms/:roomId/start` - Start session
- `POST /api/v1/rooms/:roomId/end` - End session

### Code Execution
- `POST /api/v1/rooms/:roomId/code/execute` - Execute code

### Feedback
- `POST /api/v1/feedback` - Submit feedback
- `GET /api/v1/feedback/:roomId` - Get feedback
- `PATCH /api/v1/feedback/:roomId/share` - Share feedback

---

## ✨ Next Steps

1. **Install Docker** (if using Option A) or **MongoDB/Redis** (if using Option B)
2. **Start services** using appropriate setup option
3. **Run backend**: `cd server && npm run dev`
4. **Run frontend**: `cd frontend && npm run dev`
5. **Configure API keys** in `.env` for external services
6. **Test the application** by navigating to http://localhost:8080

---

**All TypeScript compilation errors are now fixed and ready to run!** 🎉
