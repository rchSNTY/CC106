import { readDb, writeDb } from '../repositories/json-db';
import type { HistoryItem, Intensity } from '../types/models';
import { HttpError } from '../utils/errors';
import { createId } from '../utils/id';

export async function listHistory(userId: string): Promise<HistoryItem[]> {
  const db = await readDb();
  return db.history
    .filter((item) => item.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function addHistory(userId: string, input: { workoutId: string; date: string; duration: string; intensity: Intensity; notes?: string }): Promise<HistoryItem> {
  const db = await readDb();

  const workoutExists = db.workouts.some((w) => w.id === input.workoutId);
  if (!workoutExists) {
    throw new HttpError(404, 'Workout not found.');
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

  db.history.push(item);
  await writeDb(db);
  return item;
}
