import type { Request, Response } from 'express';

import { addHistory, listHistory } from '../services/history-service';
import type { Intensity } from '../types/models';

export async function getHistory(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const history = await listHistory(userId);
  res.status(200).json({ history });
}

export async function createHistory(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const { workoutId, date, duration, intensity, notes, title, completed } = req.body as {
    workoutId?: string;
    date?: string;
    duration?: string;
    intensity?: Intensity;
    notes?: string;
    title?: string;
    completed?: boolean;
  };

  if (!workoutId || !date || !duration || !intensity) {
    res.status(400).json({ message: 'workoutId, date, duration, and intensity are required.' });
    return;
  }

  const item = await addHistory(userId, { workoutId, date, duration, intensity, notes });
  res.status(201).json({ historyItem: { ...item, title, completed } });
}
