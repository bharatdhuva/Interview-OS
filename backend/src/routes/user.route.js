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
const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const router = express.Router();
// All user routes require authentication
router.use(authMiddleware.protect);
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.patch('/password', userController.changePassword);
router.get('/:id/interviews', userController.getInterviewHistory);
module.exports = router;
