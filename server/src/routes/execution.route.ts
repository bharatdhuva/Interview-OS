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

import { Router } from 'express';
import { executeCode } from '../controllers/execution.controller';
import { protect } from '../middleware/auth.middleware';

// mergeParams allows access to :roomId defined on the parent route
const router = Router({ mergeParams: true });

router.post('/execute', protect, executeCode);

export default router;
