import { getFavoritesCollection, getWorkoutsCollection } from '../repositories/collections';
import type { Workout } from '../types/models';
import { HttpError } from '../utils/errors';
import { createId } from '../utils/id';

export async function listFavorites(userId: string): Promise<Workout[]> {
  const favoritesCollection = getFavoritesCollection();
  const workoutsCollection = getWorkoutsCollection();

  const favorites = await favoritesCollection.find({ userId }).toArray();
  const favoriteIds = favorites.map((f) => f.workoutId);

  const workouts = await workoutsCollection.find({ id: { $in: favoriteIds } }).toArray();

  return workouts;
}

export async function addFavorite(userId: string, workoutId: string): Promise<void> {
  const favoritesCollection = getFavoritesCollection();
  const workoutsCollection = getWorkoutsCollection();

  const workout = await workoutsCollection.findOne({ id: workoutId });
  if (!workout) {
    throw new HttpError(404, 'Workout not found.');
  }

  const alreadyExists = await favoritesCollection.findOne({ userId, workoutId });
  if (alreadyExists) {
    return;
  }

  await favoritesCollection.insertOne({
    id: createId('fav'),
    userId,
    workoutId,
    createdAt: new Date().toISOString(),
  });
}

export async function removeFavorite(userId: string, workoutId: string): Promise<void> {
  const favoritesCollection = getFavoritesCollection();

  const result = await favoritesCollection.deleteOne({ userId, workoutId });

  if (result.deletedCount === 0) {
    throw new HttpError(404, 'Favorite entry not found.');
  }
}
