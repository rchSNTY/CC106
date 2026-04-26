import { Router } from 'express';

import { getWorkout, getWorkouts } from '../controllers/workout-controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.get('/', asyncHandler(getWorkouts));
router.get('/:id', asyncHandler(getWorkout));

export default router;
