import { Router } from 'express';

import { checkAiStatus, clearGeneratedWorkouts, generateWorkout, listGeneratedWorkouts } from '../controllers/ai-controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// POST /api/ai/generate - Generate AI workout
router.post('/generate', asyncHandler(generateWorkout));

// GET /api/ai/status - Check AI service availability
router.get('/status', asyncHandler(checkAiStatus));

// GET /api/ai/generated - List generated AI workouts
router.get('/generated', asyncHandler(listGeneratedWorkouts));

// DELETE /api/ai/generated - Delete generated AI workouts
router.delete('/generated', asyncHandler(clearGeneratedWorkouts));

export default router;
