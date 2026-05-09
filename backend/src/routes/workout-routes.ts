import { Router } from 'express';

import { getWorkout, getWorkouts } from '../controllers/workout-controller';
import { deleteWorkout } from '../controllers/workout-controller';
import { optionalAuth, requireAuth } from '../middleware/auth-middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.get('/', asyncHandler(getWorkouts));
router.get('/:id', optionalAuth, asyncHandler(getWorkout));
router.delete('/:id', requireAuth, asyncHandler(deleteWorkout));

export default router;
