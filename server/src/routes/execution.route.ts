import { Router } from 'express';
import { executeCode } from '../controllers/execution.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.post('/execute', protect, executeCode);

export default router;
