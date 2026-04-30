import type { NextFunction, Request, Response } from 'express';

import { verifyToken } from '../services/auth-service';
import { HttpError } from '../utils/errors';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authorization token is required.');
  }

  const token = authHeader.replace('Bearer ', '').trim();
  req.user = verifyToken(token);
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    next();
    return;
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new HttpError(401, 'Invalid authorization header.');
  }

  const token = authHeader.replace('Bearer ', '').trim();
  req.user = verifyToken(token);
  next();
}
