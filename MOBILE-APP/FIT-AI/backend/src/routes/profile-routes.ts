import { Router } from 'express';

import { getProfile, uploadProfileAvatar, upsertProfile } from '../controllers/profile-controller';
import { requireAuth } from '../middleware/auth-middleware';
import { uploadAvatar } from '../middleware/upload-middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.get('/', requireAuth, asyncHandler(getProfile));
router.put('/', requireAuth, asyncHandler(upsertProfile));
router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), asyncHandler(uploadProfileAvatar));

export default router;
