import type { Request, Response } from 'express';

import { getWorkoutById, listWorkouts } from '../services/workout-service';

export async function getWorkouts(req: Request, res: Response): Promise<void> {
  const intensity = typeof req.query.intensity === 'string' ? req.query.intensity : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const workouts = await listWorkouts({ intensity, search });
  res.status(200).json({ workouts });
}

export async function getWorkout(req: Request, res: Response): Promise<void> {
  const workout = await getWorkoutById(req.params.id);
  res.status(200).json({ workout });
}
