/**
 * routes/room.route.ts
 *
 * Interview room routes mounted at /api/v1/rooms
 *
 * All routes require a valid access token (protect middleware applied globally).
 *
 * GET    /join/:inviteToken        — resolve invite token → room (candidate)
 * POST   /                        — create room (interviewer | admin)
 * GET    /                        — list rooms for the current user
 * GET    /:roomId                  — get room details (participant | admin)
 * PATCH  /:roomId                  — update room metadata (interviewer | admin)
 * POST   /:roomId/start            — start session (interviewer only)
 * POST   /:roomId/end              — end session (interviewer only)
 * POST   /:roomId/cancel           — cancel room (interviewer | admin)
 */

import { Router } from 'express';
import {
  createRoom,
  listMyRooms,
  getRoomById,
  joinRoomViaToken,
  startSession,
  endSession,
  updateRoom,
  cancelRoom,
} from '../controllers/room.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// Resolve invite token before the global protect middleware so unauthenticated
// candidates can be redirected to login with the room context preserved.
// (Still requires a valid token — protect is applied here explicitly.)
router.get('/join/:inviteToken', protect, joinRoomViaToken);

// Apply authentication to all remaining routes
router.use(protect);

router.post('/',                           authorize('interviewer', 'admin'), createRoom);
router.get('/',                            listMyRooms);
router.get('/:roomId',                     getRoomById);
router.patch('/:roomId',                   authorize('interviewer', 'admin'), updateRoom);
router.post('/:roomId/start',              authorize('interviewer'),          startSession);
router.post('/:roomId/end',                authorize('interviewer'),          endSession);
router.post('/:roomId/cancel',             authorize('interviewer', 'admin'), cancelRoom);

export default router;
