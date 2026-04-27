import type { Collection } from 'mongodb';
import type { Favorite, HistoryItem, User, UserProfileRecord, Workout } from '../types/models';
import { getDb } from './mongo-client';

export function getUsersCollection(): Collection<User> {
  return getDb().collection<User>('users');
}

export function getUserProfilesCollection(): Collection<UserProfileRecord> {
  return getDb().collection<UserProfileRecord>('userProfiles');
}

export function getWorkoutsCollection(): Collection<Workout> {
  return getDb().collection<Workout>('workouts');
}

export function getFavoritesCollection(): Collection<Favorite> {
  return getDb().collection<Favorite>('favorites');
}

export function getHistoryCollection(): Collection<HistoryItem> {
  return getDb().collection<HistoryItem>('history');
}