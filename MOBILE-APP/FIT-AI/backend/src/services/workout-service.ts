import { getFavoritesCollection, getWorkoutsCollection } from '../repositories/collections';
import type { Intensity, Workout } from '../types/models';
import { HttpError } from '../utils/errors';

export async function listWorkouts(params: { intensity?: string; search?: string }): Promise<Workout[]> {
  const workoutsCollection = getWorkoutsCollection();

  const intensity = (params.intensity ?? 'All') as Intensity | 'All';
  const search = (params.search ?? '').trim().toLowerCase();

  const workouts = await workoutsCollection.find().toArray();

  return workouts.filter((workout) => {
    const intensityOk = intensity === 'All' || workout.intensity === intensity;
    const searchOk =
      search.length === 0 ||
      workout.title.toLowerCase().includes(search) ||
      workout.subtitle.toLowerCase().includes(search);

    return intensityOk && searchOk;
  });
}

export async function getWorkoutById(workoutId: string): Promise<Workout> {
  const workoutsCollection = getWorkoutsCollection();
  const workout = await workoutsCollection.findOne({ id: workoutId });

  if (!workout) {
    throw new HttpError(404, 'Workout not found.');
  }

  return workout;
}

export async function deleteWorkoutById(workoutId: string): Promise<number> {
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

  await Promise.all([
    workoutsCollection.deleteOne({ id: workoutId }),
    favoritesCollection.deleteMany({ workoutId }),
  ]);

  return 1;
}
