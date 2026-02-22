import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/db';
import logger from './utils/logger';
import dotenv from 'dotenv-safe';
import { initSocket } from './socket/index';

// Load environment variables
dotenv.config({
  allowEmptyValues: true,
  example: '.env.example'
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Socket.IO Handlers
initSocket(io);

// Connect to Database and Start Server
connectDB().then(() => {
  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}).catch(err => {
    logger.error('Failed to connect to database', err);
    process.exit(1);
});
