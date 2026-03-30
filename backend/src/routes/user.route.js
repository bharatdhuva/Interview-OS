"use strict";
/**
 * routes/user.route.ts
 *
 * User profile routes mounted at /api/v1/users
 *
 * All routes require a valid access token.
 *
 * GET    /profile           — get the authenticated user’s profile
 * PATCH  /profile           — update name and/or avatar
 * PATCH  /password          — change password (requires current password)
 * GET    /:id/interviews    — completed interview history for the given user
 *                             (own history or admin can request any user’s)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All user routes require authentication
router.use(auth_middleware_1.protect);
router.get('/profile', user_controller_1.getProfile);
router.patch('/profile', user_controller_1.updateProfile);
router.patch('/password', user_controller_1.changePassword);
router.get('/:id/interviews', user_controller_1.getInterviewHistory);
exports.default = router;
