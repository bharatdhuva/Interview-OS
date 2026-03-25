"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("../controllers/room.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const planLimit_middleware_1 = require("../middleware/planLimit.middleware");
const router = (0, express_1.Router)();
// Resolve invite token before the global protect middleware so unauthenticated
// candidates can be redirected to login with the room context preserved.
// (Still requires a valid token — protect is applied here explicitly.)
router.get('/join/:inviteToken', auth_middleware_1.protect, room_controller_1.joinRoomViaToken);
// Apply authentication to all remaining routes
router.use(auth_middleware_1.protect);
router.post('/', (0, auth_middleware_1.authorize)('interviewer', 'admin'), planLimit_middleware_1.enforceInterviewLimit, room_controller_1.createRoom);
router.get('/', room_controller_1.listMyRooms);
router.get('/:roomId', room_controller_1.getRoomById);
router.patch('/:roomId', (0, auth_middleware_1.authorize)('interviewer', 'admin'), room_controller_1.updateRoom);
router.post('/:roomId/start', (0, auth_middleware_1.authorize)('interviewer'), room_controller_1.startSession);
router.post('/:roomId/end', (0, auth_middleware_1.authorize)('interviewer'), room_controller_1.endSession);
router.post('/:roomId/cancel', (0, auth_middleware_1.authorize)('interviewer', 'admin'), room_controller_1.cancelRoom);
exports.default = router;
