import type { Request, Response } from 'express';

import {
  getGlobalAnalytics,
  getUserAnalytics,
  getProblemAnalytics,
  getLeaderboard,
} from '../services/analytics.service';
import { NotFoundError } from '../utils/errors';

export async function globalAnalyticsHandler(_req: Request, res: Response) {
  const analytics = await getGlobalAnalytics();
  return res.json(analytics);
}

export async function userAnalyticsHandler(req: Request, res: Response) {
  const userId = (req as any).user?.id;
  const analytics = await getUserAnalytics(userId);
  return res.json(analytics);
}

export async function problemAnalyticsHandler(req: Request, res: Response) {
  const pid = Number(req.params.pid);
  const analytics = await getProblemAnalytics(pid);
  if (!analytics) throw new NotFoundError('Problem not found');
  return res.json(analytics);
}

export async function leaderboardHandler(req: Request, res: Response) {
  const limit = req.query.limit ? Math.min(100, Number(req.query.limit)) : 20;
  const data = await getLeaderboard(limit);
  return res.json(data);
}
