import { Router } from 'express';
import { createRoom, listMyRooms, getRoomById, joinRoomViaToken, startSession, endSession, updateRoom, cancelRoom } from '../controllers/room.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/join/:inviteToken', protect, joinRoomViaToken);

router.use(protect);

router.post('/', authorize('interviewer', 'admin'), createRoom);
router.get('/', listMyRooms);
router.get('/:roomId', getRoomById);
router.patch('/:roomId', authorize('interviewer', 'admin'), updateRoom);
router.post('/:roomId/start', authorize('interviewer'), startSession);
router.post('/:roomId/end', authorize('interviewer'), endSession);
router.post('/:roomId/cancel', authorize('interviewer', 'admin'), cancelRoom);

export default router;
