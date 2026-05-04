import type { DatabaseSchema } from '../types/models';
import {
  getFavoritesCollection,
  getHistoryCollection,
  getUserProfilesCollection,
  getUsersCollection,
  getWorkoutsCollection,
} from './collections';

export async function readDb(): Promise<DatabaseSchema> {
  const [users, userProfiles, workouts, favorites, history] = await Promise.all([
    getUsersCollection().find().toArray(),
    getUserProfilesCollection().find().toArray(),
    getWorkoutsCollection().find().toArray(),
    getFavoritesCollection().find().toArray(),
    getHistoryCollection().find().toArray(),
  ]);

  return { users, userProfiles, workouts, favorites, history };
}

export async function writeDb(_db: DatabaseSchema): Promise<void> {
  console.log('MongoDB: writeDb called (no-op - data is auto-persisted)');
}
