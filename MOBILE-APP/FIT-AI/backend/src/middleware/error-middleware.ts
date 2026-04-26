import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '../utils/errors';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, 'Route not found.'));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({
      message: 'Internal server error.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
    return;
  }

  res.status(500).json({
    message: 'Internal server error.',
  });
}
