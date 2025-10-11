import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createProblem,
  deleteProblem,
  getProblemByPid,
  listProblems,
  updateProblem,
} from '../services/problem.service';

export const createProblemSchema = z.object({
  title: z.string().min(3).max(120),
  descriptionMd: z.string().min(1), // markdown content
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string().min(1)).max(20).optional(),
});

export const updateProblemSchema = createProblemSchema.partial();

export async function createProblemHandler(
  req: Request<unknown, unknown, z.infer<typeof createProblemSchema>>,
  res: Response
) {
  const problem = await createProblem(req.body);
  return res.status(201).json({ problem });
}

export async function getProblemHandler(req: Request, res: Response) {
  const pid = Number(req.params.pid);
  const problem = await getProblemByPid(pid);
  return res.json({ problem });
}

export async function listProblemsHandler(req: Request, res: Response) {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const tag = req.query.tag ? String(req.query.tag) : undefined;
  const data = await listProblems({ page, limit, tag });
  return res.json(data);
}

export async function updateProblemHandler(req: Request, res: Response) {
  const pid = Number(req.params.pid);
  const body = req.body as z.infer<typeof updateProblemSchema>;
  const problem = await updateProblem(pid, body);
  return res.json({ problem });
}

export async function deleteProblemHandler(req: Request, res: Response) {
  const pid = Number(req.params.pid);
  await deleteProblem(pid);
  return res.status(204).send();
}
