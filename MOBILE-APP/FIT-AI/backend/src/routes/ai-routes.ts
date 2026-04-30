import { Router } from 'express';

import { checkAiStatus, clearGeneratedWorkouts, generateWorkout, listGeneratedWorkouts } from '../controllers/ai-controller';
import { requireAuth } from '../middleware/auth-middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// POST /api/ai/generate - Generate AI workout
router.post('/generate', requireAuth, asyncHandler(generateWorkout));

// GET /api/ai/status - Check AI service availability
router.get('/status', asyncHandler(checkAiStatus));

// GET /api/ai/generated - List generated AI workouts
router.get('/generated', requireAuth, asyncHandler(listGeneratedWorkouts));

// DELETE /api/ai/generated - Delete generated AI workouts
router.delete('/generated', requireAuth, asyncHandler(clearGeneratedWorkouts));

export default router;
