import type { Request, Response } from 'express';
import { z } from 'zod';

import { getUserLastCode, listUserSubmissions } from '../services/submission.service';

export const getMyLastCodeSchema = z.object({
  pid: z.coerce.number().int().positive(),
  language: z.enum(['javascript', 'typescript', 'python', 'cpp', 'java']).optional(),
});

export async function getMyLastCodeHandler(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const q = getMyLastCodeSchema.parse(req.query);
  const result = await getUserLastCode({ userId, pid: q.pid, language: q.language });
  return res.json(result);
}

export const listMySubmissionsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  includeCode: z.coerce.boolean().optional(),
});

export async function listMySubmissionsHandler(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const q = listMySubmissionsSchema.parse(req.query);
  const docs = await listUserSubmissions({ userId, limit: q.limit, includeCode: q.includeCode });
  return res.json({ submissions: docs });
}
