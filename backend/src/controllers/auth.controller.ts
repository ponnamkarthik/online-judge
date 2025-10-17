import type { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../lib/env';
import {
  registerUser,
  loginUser,
  refreshTokens,
  getUserById,
  logout,
} from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const secure = env.isProd;
  const sameSite: 'lax' | 'strict' | 'none' = env.isProd ? 'none' : 'lax';

  // Only set domain for production; omit for localhost to allow it to work across ports
  const cookieOptions: any = {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
  };

  // Only set domain if COOKIE_DOMAIN is specified (production)
  if (env.COOKIE_DOMAIN) {
    cookieOptions.domain = env.COOKIE_DOMAIN;
  }

  res.cookie('access_token', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

export async function registerHandler(
  req: Request<unknown, unknown, z.infer<typeof registerSchema>>,
  res: Response
) {
  await registerUser(req.body);
  // Auto-login after registration
  const login = await loginUser({
    email: req.body.email,
    password: req.body.password,
    userAgent: req.headers['user-agent'] || undefined,
    ip: req.ip,
  });
  setAuthCookies(res, login.accessToken, login.refreshToken);
  return res.status(201).json({ user: login.user });
}

export async function loginHandler(
  req: Request<unknown, unknown, z.infer<typeof loginSchema>>,
  res: Response
) {
  const { user, accessToken, refreshToken } = await loginUser({
    email: req.body.email,
    password: req.body.password,
    userAgent: req.headers['user-agent'] || undefined,
    ip: req.ip,
  });
  setAuthCookies(res, accessToken, refreshToken);
  return res.json({ user });
}

export async function meHandler(req: Request & { user?: { id: string } }, res: Response) {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();
  const user = await getUserById(userId);
  return res.json({ user });
}

export async function refreshHandler(req: Request, res: Response) {
  const refreshToken: string | undefined =
    req.cookies?.refresh_token || (req.body as any)?.refreshToken;
  if (!refreshToken) throw new UnauthorizedError('Missing refresh token');
  const { accessToken, refreshToken: newRefresh } = await refreshTokens(refreshToken, {
    userAgent: req.headers['user-agent'] || undefined,
    ip: req.ip,
  });
  setAuthCookies(res, accessToken, newRefresh);
  return res.json({ ok: true });
}

export async function logoutHandler(req: Request, res: Response) {
  const refreshToken: string | undefined =
    req.cookies?.refresh_token || (req.body as any)?.refreshToken;
  await logout(refreshToken ?? '');
  const secure = env.isProd;
  const sameSite: 'lax' | 'strict' | 'none' = env.isProd ? 'none' : 'lax';

  const clearOptions: any = { httpOnly: true, secure, sameSite, path: '/' };
  if (env.COOKIE_DOMAIN) {
    clearOptions.domain = env.COOKIE_DOMAIN;
  }

  res.clearCookie('access_token', clearOptions);
  res.clearCookie('refresh_token', {
    ...clearOptions,
    path: '/api/auth',
  });
  return res.json({ ok: true });
}
