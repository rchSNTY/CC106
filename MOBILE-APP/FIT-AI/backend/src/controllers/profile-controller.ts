import type { Request, Response } from 'express';
import path from 'path';

import { env } from '../config/env';
import { getUserProfile, saveUserProfile } from '../services/auth-service';
import type { UserProfile } from '../types/models';

function normalizeWeeklyGoal(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const parsed = Number(value.trim());
    if (parsed > 0) {
      return Math.round(parsed);
    }
  }

  return 5;
}

function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    weeklyGoal: normalizeWeeklyGoal(profile.weeklyGoal),
  };
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const profile = await getUserProfile(userId);
  res.status(200).json({ profile: profile ? normalizeProfile(profile) : null });
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

  const weeklyGoal = normalizeWeeklyGoal(payload.weeklyGoal);
  if (weeklyGoal < 1 || weeklyGoal > 14) {
    res.status(400).json({ message: 'weeklyGoal must be between 1 and 14.' });
    return;
  }

  const saved = await saveUserProfile(userId, {
    ...payload,
    weeklyGoal,
  });
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
    weeklyGoal: 5,
  };

  const saved = await saveUserProfile(userId, {
    ...normalizeProfile(currentProfile),
    avatarUrl,
  });

  res.status(200).json({ avatarUrl: saved.avatarUrl });
}
