import { getFavoritesCollection, getWorkoutsCollection } from '../repositories/collections';
import type { Intensity, Workout } from '../types/models';
import { HttpError } from '../utils/errors';

export async function listWorkouts(params: { intensity?: string; search?: string }): Promise<Workout[]> {
  const workoutsCollection = getWorkoutsCollection();

  const intensity = (params.intensity ?? 'All') as Intensity | 'All';
  const search = (params.search ?? '').trim().toLowerCase();

  // Preset workouts are public. AI workouts are user-scoped and must be fetched via /api/ai/generated.
  const workouts = await workoutsCollection.find({ source: { $ne: 'ai' } }).toArray();

  return workouts.filter((workout) => {
    const intensityOk = intensity === 'All' || workout.intensity === intensity;
    const searchOk =
      search.length === 0 ||
      workout.title.toLowerCase().includes(search) ||
      workout.subtitle.toLowerCase().includes(search);

    return intensityOk && searchOk;
  });
}

export async function getWorkoutById(workoutId: string, userId?: string): Promise<Workout> {
  const workoutsCollection = getWorkoutsCollection();
  const workout = await workoutsCollection.findOne({ id: workoutId });

  if (!workout) {
    throw new HttpError(404, 'Workout not found.');
  }

  if (workout.source === 'ai') {
    if (!userId) {
      throw new HttpError(401, 'Authorization token is required.');
    }

    if (!workout.userId || workout.userId !== userId) {
      // Hide existence of other users' AI workouts.
      throw new HttpError(404, 'Workout not found.');
    }
  }

  return workout;
}

export async function deleteWorkoutById(workoutId: string, userId: string): Promise<number> {
  const workoutsCollection = getWorkoutsCollection();
  const favoritesCollection = getFavoritesCollection();

  const workout = await workoutsCollection.findOne({ id: workoutId });
  if (!workout) {
    throw new HttpError(404, 'Workout not found.');
  }

  // Only allow deleting AI-generated workouts
  if (workout.source !== 'ai') {
    throw new HttpError(403, 'Only AI-generated workouts can be deleted.');
  }

  if (!workout.userId || workout.userId !== userId) {
    throw new HttpError(403, 'You do not have permission to delete this workout.');
  }

  await Promise.all([
    workoutsCollection.deleteOne({ id: workoutId, userId }),
    favoritesCollection.deleteMany({ workoutId }),
  ]);

  return 1;
}
