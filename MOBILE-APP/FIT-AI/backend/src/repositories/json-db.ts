import fs from 'fs/promises';
import path from 'path';

import { env } from '../config/env';
import type { DatabaseSchema } from '../types/models';

async function ensureDbFile(): Promise<void> {
  const folder = path.dirname(env.dbPath);
  await fs.mkdir(folder, { recursive: true });

  try {
    await fs.access(env.dbPath);
  } catch {
    const initial: DatabaseSchema = {
      users: [],
      userProfiles: [],
      workouts: [],
      favorites: [],
      history: [],
    };
    await fs.writeFile(env.dbPath, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

export async function readDb(): Promise<DatabaseSchema> {
  await ensureDbFile();
  const file = await fs.readFile(env.dbPath, 'utf-8');
  return JSON.parse(file) as DatabaseSchema;
}

export async function writeDb(db: DatabaseSchema): Promise<void> {
  await ensureDbFile();
  await fs.writeFile(env.dbPath, JSON.stringify(db, null, 2), 'utf-8');
}
