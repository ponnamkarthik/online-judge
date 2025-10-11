import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../lib/logger';

export function notFoundMiddleware(_req: Request, res: Response) {
  return res.status(404).json({
    success: false,
    error: {
      type: 'NotFoundError',
      message: 'Not Found',
    },
  });
}

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Zod validation errors
  if (err instanceof ZodError) {
    const fields = Object.fromEntries(
      err.issues.map((i) => [i.path.join('.') || 'root', i.message])
    );
    const zErr = new ValidationError('Validation failed', fields);
    return res.status(zErr.statusCode).json({
      success: false,
      error: { type: zErr.type, message: zErr.message, fields },
    });
  }

  // Custom application errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error({ err }, 'AppError');
    return res.status(err.statusCode).json({
      success: false,
      error: { type: err.type, message: err.message, ...(err.meta ?? {}) },
    });
  }

  // Unknown errors
  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    error: { type: 'InternalServerError', message: 'Internal Server Error' },
  });
}
