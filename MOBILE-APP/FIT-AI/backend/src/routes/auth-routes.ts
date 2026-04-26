import { Router } from 'express';

import { login, logout, me, register } from '../controllers/auth-controller';
import { requireAuth } from '../middleware/auth-middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', requireAuth, asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));

export default router;
