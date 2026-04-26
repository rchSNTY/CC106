import type { Request, Response } from 'express';
import path from 'path';

import { env } from '../config/env';
import { getUserProfile, saveUserProfile } from '../services/auth-service';
import type { UserProfile } from '../types/models';

export async function getProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const profile = await getUserProfile(userId);
  res.status(200).json({ profile });
}

export async function upsertProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const payload = req.body as UserProfile;
  const requiredFields: Array<keyof UserProfile> = ['name', 'birthday', 'gender', 'height', 'weight', 'activityLevel'];

  for (const field of requiredFields) {
    if (!payload[field] || String(payload[field]).trim().length === 0) {
      res.status(400).json({ message: `${field} is required.` });
      return;
    }
  }

  const saved = await saveUserProfile(userId, payload);
  res.status(200).json({ profile: saved });
}

export async function uploadProfileAvatar(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: 'Avatar file is required.' });
    return;
  }

  const avatarPath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
  const avatarUrl = `${env.baseUrl}/${avatarPath}`;

  const currentProfile = (await getUserProfile(userId)) ?? {
    avatarUrl: null,
    name: '',
    age: '',
    birthday: '',
    gender: '',
    height: '',
    heightUnit: 'cm',
    weight: '',
    activityLevel: 'Moderate',
    workout: '',
  };

  const saved = await saveUserProfile(userId, {
    ...currentProfile,
    avatarUrl,
  });

  res.status(200).json({ avatarUrl: saved.avatarUrl });
}
