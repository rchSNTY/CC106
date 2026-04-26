import { readDb, writeDb } from '../repositories/json-db';
import type { Workout } from '../types/models';
import { HttpError } from '../utils/errors';
import { createId } from '../utils/id';

export async function listFavorites(userId: string): Promise<Workout[]> {
  const db = await readDb();
  const favoriteIds = db.favorites.filter((f) => f.userId === userId).map((f) => f.workoutId);

  return db.workouts.filter((w) => favoriteIds.includes(w.id));
}

export async function addFavorite(userId: string, workoutId: string): Promise<void> {
  const db = await readDb();

  const workout = db.workouts.find((w) => w.id === workoutId);
  if (!workout) {
    throw new HttpError(404, 'Workout not found.');
  }

  const alreadyExists = db.favorites.some((f) => f.userId === userId && f.workoutId === workoutId);
  if (alreadyExists) {
    return;
  }

  db.favorites.push({
    id: createId('fav'),
    userId,
    workoutId,
    createdAt: new Date().toISOString(),
  });

  await writeDb(db);
}

export async function removeFavorite(userId: string, workoutId: string): Promise<void> {
  const db = await readDb();
  const next = db.favorites.filter((f) => !(f.userId === userId && f.workoutId === workoutId));

  if (next.length === db.favorites.length) {
    throw new HttpError(404, 'Favorite entry not found.');
  }

  db.favorites = next;
  await writeDb(db);
}
