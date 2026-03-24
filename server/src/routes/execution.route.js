"use strict";
/**
 * routes/execution.route.ts
 *
 * Code execution routes mounted at /api/v1/rooms/:roomId/code
 *
 * `mergeParams: true` is required so that `:roomId` from the parent
 * router is accessible inside this sub-router via req.params.roomId.
 *
 * POST /execute  — submit code to Judge0 and return the result
 *                  (any room participant may execute)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const execution_controller_1 = require("../controllers/execution.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
// mergeParams allows access to :roomId defined on the parent route
const router = (0, express_1.Router)({ mergeParams: true });
router.post('/execute', auth_middleware_1.protect, execution_controller_1.executeCode);
exports.default = router;
