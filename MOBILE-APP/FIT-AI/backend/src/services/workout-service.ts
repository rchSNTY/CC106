import { readDb } from '../repositories/json-db';
import type { Intensity, Workout } from '../types/models';
import { HttpError } from '../utils/errors';

export async function listWorkouts(params: { intensity?: string; search?: string }): Promise<Workout[]> {
  const db = await readDb();

  const intensity = (params.intensity ?? 'All') as Intensity | 'All';
  const search = (params.search ?? '').trim().toLowerCase();

  return db.workouts.filter((workout) => {
    const intensityOk = intensity === 'All' || workout.intensity === intensity;
    const searchOk =
      search.length === 0 ||
      workout.title.toLowerCase().includes(search) ||
      workout.subtitle.toLowerCase().includes(search);

    return intensityOk && searchOk;
  });
}

export async function getWorkoutById(workoutId: string): Promise<Workout> {
  const db = await readDb();
  const workout = db.workouts.find((w) => w.id === workoutId);

  if (!workout) {
    throw new HttpError(404, 'Workout not found.');
  }

  return workout;
}
