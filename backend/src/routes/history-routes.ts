import { Router } from 'express';

import { createHistory, getHistory } from '../controllers/history-controller';
import { requireAuth } from '../middleware/auth-middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.get('/', requireAuth, asyncHandler(getHistory));
router.post('/', requireAuth, asyncHandler(createHistory));

export default router;
