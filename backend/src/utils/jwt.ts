import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';

import { env } from '../lib/env';

export type JwtPayload = { sub: string; role: string; type: 'access' | 'refresh' } & jwt.JwtPayload;

export function signAccessToken(userId: string, role: string) {
  const options: SignOptions = { expiresIn: env.ACCESS_TOKEN_TTL as unknown as number };
  return jwt.sign({ sub: userId, role, type: 'access' }, env.JWT_ACCESS_SECRET as Secret, options);
}

export function signRefreshToken(userId: string, role: string, sessionId: string) {
  const options: SignOptions = { expiresIn: env.REFRESH_TOKEN_TTL as unknown as number };
  return jwt.sign(
    { sub: userId, role, type: 'refresh', sid: sessionId },
    env.JWT_REFRESH_SECRET as Secret,
    options
  );
}

export function verifyAccessToken(token: string) {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  if (decoded.type !== 'access') throw new Error('Invalid token type');
  return decoded;
}

export function verifyRefreshToken(token: string) {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload & { sid: string };
  if (decoded.type !== 'refresh') throw new Error('Invalid token type');
  return decoded;
}
