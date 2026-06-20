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
const express = require("express");
const roomController = require("../controllers/room.controller");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();
// Resolve invite token before the global protect middleware so unauthenticated
// candidates can be redirected to login with the room context preserved.
// (Still requires a valid token — protect is applied here explicitly.)
router.get('/join/:inviteToken', authMiddleware.protect, roomController.joinRoomViaToken);
// Apply authentication to all remaining routes
router.use(authMiddleware.protect);
router.post('/', authMiddleware.authorize('interviewer', 'admin'), roomController.createRoom);
router.get('/', roomController.listMyRooms);
router.get('/:roomId', roomController.getRoomById);
router.patch('/:roomId', authMiddleware.authorize('interviewer', 'admin'), roomController.updateRoom);
router.post('/:roomId/start', authMiddleware.authorize('interviewer'), roomController.startSession);
router.post('/:roomId/end', authMiddleware.authorize('interviewer'), roomController.endSession);
router.post('/:roomId/cancel', authMiddleware.authorize('interviewer', 'admin'), roomController.cancelRoom);

// Fetch session replay frames (accessible by participants)
router.get('/:roomId/replay', roomController.getReplayFrames);

module.exports = router;
