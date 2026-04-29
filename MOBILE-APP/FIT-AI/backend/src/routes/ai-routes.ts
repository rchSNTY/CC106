import { Router } from 'express';

import { checkAiStatus, generateWorkout } from '../controllers/ai-controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

// POST /api/ai/generate - Generate AI workout
router.post('/generate', asyncHandler(generateWorkout));

// GET /api/ai/status - Check AI service availability
router.get('/status', asyncHandler(checkAiStatus));

export default router;