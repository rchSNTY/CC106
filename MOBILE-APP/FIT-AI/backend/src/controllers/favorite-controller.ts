import type { Request, Response } from 'express';

import { addFavorite, listFavorites, removeFavorite } from '../services/favorite-service';

export async function getFavorites(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const favorites = await listFavorites(userId);
  res.status(200).json({ favorites });
}

export async function createFavorite(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const workoutId = req.params.workoutId;
  await addFavorite(userId, workoutId);
  res.status(201).json({ message: 'Workout added to favorites.' });
}

export async function deleteFavorite(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const workoutId = req.params.workoutId;
  await removeFavorite(userId, workoutId);
  res.status(200).json({ message: 'Workout removed from favorites.' });
}
