import { Router } from 'express';

import { createFavorite, deleteFavorite, getFavorites } from '../controllers/favorite-controller';
import { requireAuth } from '../middleware/auth-middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.get('/', requireAuth, asyncHandler(getFavorites));
router.post('/:workoutId', requireAuth, asyncHandler(createFavorite));
router.delete('/:workoutId', requireAuth, asyncHandler(deleteFavorite));

export default router;
