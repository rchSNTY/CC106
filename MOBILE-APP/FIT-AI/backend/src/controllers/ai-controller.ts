import type { Request, Response } from 'express';

import type { AiWorkoutRequest } from '../services/ai-service';
import {
  deleteGeneratedAiWorkouts,
  generateAiWorkout,
  getAiServiceStatus,
  listGeneratedAiWorkouts,
} from '../services/ai-service';
import { HttpError } from '../utils/errors';

export async function generateWorkout(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const profile = req.body as AiWorkoutRequest;

  // Debug log
  console.log('AI Generation Request Body:', JSON.stringify(profile, null, 2));

  // Validate required fields
  const missingFields: string[] = [];
  if (!profile.name || typeof profile.name !== 'string' || profile.name.trim() === '') {
    missingFields.push('name');
  }
  if (!profile.activityLevel || typeof profile.activityLevel !== 'string' || profile.activityLevel.trim() === '') {
    missingFields.push('activityLevel');
  }
  if (!profile.workout || typeof profile.workout !== 'string' || profile.workout.trim() === '') {
    missingFields.push('workout');
  }

  if (missingFields.length > 0) {
    console.log('Validation failed - missing fields:', missingFields);
    res.status(400).json({
      error: `Missing or empty required profile fields: ${missingFields.join(', ')}`,
      received: {
        name: profile.name ?? 'missing',
        activityLevel: profile.activityLevel ?? 'missing',
        workout: profile.workout ?? 'missing',
      },
    });
    return;
  }

  try {
    const workouts = await generateAiWorkout(profile, userId);
    res.status(200).json({ workouts });
  } catch (error) {
    if (error instanceof HttpError) {
      // Log detailed error to backend console for debugging
      console.log(`❌ AI Generation Error (${error.statusCode}):`, error.message);
      
      // Return generic message to frontend (don't expose API details)
      const userMessage = error.statusCode === 503
        ? 'AI service is not configured'
        : 'Failed to generate workout. Please try again.';
      
      res.status(error.statusCode).json({ message: userMessage });
      return;
    }

    const err = error as Error;
    const errorMsg = err.message ?? 'Failed to generate workout';
    // Log unexpected error to backend console
    console.log('❌ Unexpected Error:', errorMsg);
    
    // Return generic message to frontend
    res.status(500).json({ message: 'Failed to generate workout. Please try again.' });
  }
}

export async function checkAiStatus(req: Request, res: Response): Promise<void> {
  const status = await getAiServiceStatus();
  res.status(200).json(status);
}

export async function clearGeneratedWorkouts(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const deletedCount = await deleteGeneratedAiWorkouts(userId);
  res.status(200).json({ deletedCount });
}

export async function listGeneratedWorkouts(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const workouts = await listGeneratedAiWorkouts(userId);
  res.status(200).json({ workouts });
}
