import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';

import { env } from '../config/env';
import { readDb, writeDb } from '../repositories/json-db';
import type { User, UserProfile } from '../types/models';
import { HttpError } from '../utils/errors';
import { createId } from '../utils/id';

export type SafeUser = Omit<User, 'passwordHash'>;

type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

type LoginInput = {
  username: string;
  password: string;
};

type AuthResponse = {
  token: string;
  user: SafeUser;
};

function toSafeUser(user: User): SafeUser {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function signToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string): JwtPayload & { userId: string } {
  const payload = jwt.verify(token, env.jwtSecret);
  if (typeof payload === 'string' || !('userId' in payload)) {
    throw new HttpError(401, 'Invalid token payload.');
  }
  return payload as JwtPayload & { userId: string };
}

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();

  if (username.length < 3) {
    throw new HttpError(400, 'Username must be at least 3 characters.');
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new HttpError(400, 'Please provide a valid email address.');
  }

  if (input.password.length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters.');
  }

  const db = await readDb();

  const existingUsername = db.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (existingUsername) {
    throw new HttpError(409, 'Username is already taken.');
  }

  const existingEmail = db.users.find((u) => u.email.toLowerCase() === email);
  if (existingEmail) {
    throw new HttpError(409, 'Email is already registered.');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user: User = {
    id: createId('user'),
    username,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  await writeDb(db);

  const token = signToken(user.id);

  return {
    token,
    user: toSafeUser(user),
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const db = await readDb();
  const username = input.username.trim().toLowerCase();

  const user = db.users.find((u) => u.username.toLowerCase() === username);

  if (!user) {
    throw new HttpError(401, 'Invalid username or password.');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Invalid username or password.');
  }

  return {
    token: signToken(user.id),
    user: toSafeUser(user),
  };
}

export async function getCurrentUser(userId: string): Promise<SafeUser> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);

  if (!user) {
    throw new HttpError(404, 'User not found.');
  }

  return toSafeUser(user);
}

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<UserProfile> {
  const db = await readDb();
  const existing = db.userProfiles.find((record) => record.userId === userId);

  if (existing) {
    existing.profile = profile;
    existing.updatedAt = new Date().toISOString();
  } else {
    db.userProfiles.push({
      userId,
      profile,
      updatedAt: new Date().toISOString(),
    });
  }

  await writeDb(db);
  return profile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = await readDb();
  const found = db.userProfiles.find((record) => record.userId === userId);
  return found?.profile ?? null;
}
