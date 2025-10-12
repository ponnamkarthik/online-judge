import type { Request, Response } from 'express';
import { z } from 'zod';
import { Problem } from '../models/problem.model';
import { TestCase } from '../models/testcase.model';
import { NotFoundError } from '../utils/errors';

export const bulkCreateTestcasesSchema = z.object({
  pid: z.number().int().positive(),
  cases: z
    .array(
      z.object({
        input: z.string().min(1),
        expectedOutput: z.string().min(1),
        isSample: z.boolean().optional(),
        timeLimitMs: z.number().int().min(100).max(20000).optional(),
      })
    )
    .min(1)
    .max(1000),
});

export async function bulkCreateTestcasesHandler(
  req: Request<unknown, unknown, z.infer<typeof bulkCreateTestcasesSchema>>,
  res: Response
) {
  const { pid, cases } = req.body;
  const problem = await Problem.findOne({ pid });
  if (!problem) throw new NotFoundError('Problem not found');

  const docs = await TestCase.insertMany(
    cases.map((c) => ({
      problem: problem._id,
      input: c.input,
      expectedOutput: c.expectedOutput,
      isSample: Boolean(c.isSample),
      timeLimitMs: c.timeLimitMs ?? 2000,
    }))
  );

  return res.status(201).json({
    pid,
    created: docs.length,
    cases: docs.map((d) => ({
      id: String(d._id),
      isSample: d.isSample,
      timeLimitMs: d.timeLimitMs,
    })),
  });
}
