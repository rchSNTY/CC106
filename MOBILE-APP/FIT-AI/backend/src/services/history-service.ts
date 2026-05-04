import { getHistoryCollection, getWorkoutsCollection } from '../repositories/collections';
import type { HistoryItem, Intensity } from '../types/models';
import { HttpError } from '../utils/errors';
import { createId } from '../utils/id';

export async function listHistory(userId: string): Promise<HistoryItem[]> {
  const historyCollection = getHistoryCollection();
  const history = await historyCollection.find({ userId }).sort({ date: -1 }).toArray();
  return history;
}

export async function addHistory(userId: string, input: { workoutId: string; date: string; duration: string; intensity: Intensity; notes?: string }): Promise<HistoryItem> {
  const historyCollection = getHistoryCollection();
  const workoutsCollection = getWorkoutsCollection();

  const workoutExists = await workoutsCollection.findOne({ id: input.workoutId });
  if (!workoutExists) {
    throw new HttpError(404, 'Workout not found.');
  }

  if (workoutExists.source === 'ai' && workoutExists.userId !== userId) {
    throw new HttpError(403, 'You do not have permission to log this workout.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new HttpError(400, 'Date must be in YYYY-MM-DD format.');
  }

  const item: HistoryItem = {
    id: createId('hist'),
    userId,
    workoutId: input.workoutId,
    date: input.date,
    duration: input.duration,
    intensity: input.intensity,
    notes: input.notes,
  };

  await historyCollection.insertOne(item);
  return item;
}
