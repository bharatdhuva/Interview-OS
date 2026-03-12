/**
 * routes/admin.route.ts
 *
 * Admin-only management routes mounted at /api/v1/admin
 *
 * Every route is double-guarded: must be authenticated AND have the 'admin' role.
 *
 * GET    /users                    — paginated list of all users
 * PATCH  /users/:id/role           — change a user’s role
 * DELETE /users/:id                — hard-delete a user
 * GET    /rooms                    — list all interview rooms
 * POST   /rooms/:id/force-end      — forcefully terminate a room/session
 * GET    /analytics                — platform-wide stats
 */

import { Router } from 'express';
import {
  getAllUsers,
  changeUserRole,
  deleteUser,
  getAllRooms,
  forceEndRoom,
  getSystemAnalytics,
} from '../controllers/admin.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication + admin role check to every route in this file
router.use(protect);
router.use(authorize('admin'));

router.get('/users',                   getAllUsers);
router.patch('/users/:id/role',        changeUserRole);
router.delete('/users/:id',            deleteUser);
router.get('/rooms',                   getAllRooms);
router.post('/rooms/:id/force-end',    forceEndRoom);
router.get('/analytics',               getSystemAnalytics);

export default router;
