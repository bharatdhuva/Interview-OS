import { Router } from 'express';
import { createRoom, listMyRooms, getRoomById, joinRoomViaToken, startSession, endSession } from '../controllers/room.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public / Invite join point based on verification
router.get('/join/:inviteToken', protect, joinRoomViaToken);

// Protected Routes
router.use(protect);

router.post('/', authorize('interviewer', 'admin'), createRoom);
router.get('/', listMyRooms);
router.get('/:roomId', getRoomById);

router.post('/:roomId/start', authorize('interviewer'), startSession);
router.post('/:roomId/end', authorize('interviewer'), endSession);


// You can implement PATCH and DELETE later as needed

export default router;
