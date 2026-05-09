import type { Request, Response } from 'express';

import { getCurrentUser, loginUser, registerUser } from '../services/auth-service';

export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password, confirmPassword } = req.body as {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };

  if (!username || !email || !password || !confirmPassword) {
    res.status(400).json({ message: 'username, email, password, and confirmPassword are required.' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ message: 'Passwords do not match.' });
    return;
  }

  const result = await registerUser({ username, email, password });
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ message: 'username and password are required.' });
    return;
  }

  const result = await loginUser({ username, password });
  res.status(200).json(result);
}

export async function me(req: Request, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }

  const user = await getCurrentUser(userId);
  res.status(200).json({ user });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ message: 'Logged out. Remove token on client.' });
}
