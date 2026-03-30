"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply authentication + admin role check to every route in this file
router.use(auth_middleware_1.protect);
router.use((0, auth_middleware_1.authorize)('admin'));
router.get('/users', admin_controller_1.getAllUsers);
router.patch('/users/:id/role', admin_controller_1.changeUserRole);
router.delete('/users/:id', admin_controller_1.deleteUser);
router.get('/rooms', admin_controller_1.getAllRooms);
router.post('/rooms/:id/force-end', admin_controller_1.forceEndRoom);
router.get('/analytics', admin_controller_1.getSystemAnalytics);
exports.default = router;
