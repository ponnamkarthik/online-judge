import type { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

export function validate<T>(schema: ZodSchema<T>, path: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const source = (req as unknown as Record<string, unknown>)[path];
      const data = schema.parse(source);
      (req as unknown as Record<string, unknown>)[path] = data as unknown as T;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const fields = Object.fromEntries(
          err.errors.map((e) => [e.path.join('.') || 'root', e.message])
        );
        return next(new ValidationError('Validation failed', fields));
      }
      return next(err);
    }
  };
}
