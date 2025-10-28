import type { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  let token: string | undefined;
  if (header?.startsWith('Bearer ')) token = header.slice(7);
  if (!token) token = req.cookies?.access_token;

  if (!token) return next(new UnauthorizedError());

  try {
    const payload = verifyAccessToken(token);
    (req as unknown as { user?: { id: string; role: string } }).user = {
      id: String(payload.sub),
      role: payload.role,
    };
    return next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}

// Optional auth: attaches req.user if a valid token is present; otherwise continues without error
export function maybeAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    let token: string | undefined;
    if (header?.startsWith('Bearer ')) token = header.slice(7);
    if (!token) token = req.cookies?.access_token;

    if (!token) return next();

    const payload = verifyAccessToken(token);
    (req as unknown as { user?: { id: string; role: string } }).user = {
      id: String(payload.sub),
      role: payload.role,
    };
    return next();
  } catch {
    return next();
  }
}
