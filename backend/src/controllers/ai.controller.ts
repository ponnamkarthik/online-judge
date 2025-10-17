import type { Request, Response } from 'express';
import { z } from 'zod';

import { getAIReview } from '../services/ai.service';

export const aiReviewSchema = z.object({
  language: z.enum(['javascript', 'typescript', 'python', 'cpp', 'java']),
  code: z.string().min(1),
  prompt: z.string().max(2000).optional(),
});

export async function aiReviewHandler(
  req: Request<unknown, unknown, z.infer<typeof aiReviewSchema>>,
  res: Response
) {
  const { language, code, prompt } = req.body;
  const { advice } = await getAIReview({ language, code, prompt });
  return res.json({ advice });
}
