import type { Request, Response } from 'express';
import { z } from 'zod';
import { Problem } from '../models/problem.model';
import { TestCase } from '../models/testcase.model';
import { NotFoundError } from '../utils/errors';

// Schema for bulk creating test cases
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

// Schema for creating a single test case
export const createTestcaseSchema = z.object({
  body: z.object({
    input: z.string().min(1),
    expectedOutput: z.string().min(1),
    isSample: z.boolean().optional(),
    timeLimitMs: z.number().int().min(100).max(20000).optional(),
  }),
});

// Schema for updating a test case
export const updateTestcaseSchema = z.object({
  body: z.object({
    input: z.string().min(1).optional(),
    expectedOutput: z.string().min(1).optional(),
    isSample: z.boolean().optional(),
    timeLimitMs: z.number().int().min(100).max(20000).optional(),
  }),
});

/**
 * GET /api/testcases/problem/:pid
 * Get all test cases for a specific problem
 */
export async function getTestcasesByProblemHandler(req: Request, res: Response) {
  const pid = Number(req.params.pid);

  const problem = await Problem.findOne({ pid });
  if (!problem) throw new NotFoundError('Problem not found');

  const testcases = await TestCase.find({ problem: problem._id })
    .select('input expectedOutput isSample timeLimitMs createdAt updatedAt')
    .sort({ isSample: -1, createdAt: 1 }) // Sample cases first
    .lean();

  return res.json({
    pid,
    total: testcases.length,
    testcases: testcases.map((tc) => ({
      id: String(tc._id),
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isSample: tc.isSample,
      timeLimitMs: tc.timeLimitMs,
      createdAt: tc.createdAt,
      updatedAt: tc.updatedAt,
    })),
  });
}

/**
 * POST /api/testcases/problem/:pid
 * Create a single test case for a problem
 */
export async function createTestcaseHandler(req: Request, res: Response) {
  const pid = Number(req.params.pid);
  const { input, expectedOutput, isSample, timeLimitMs } = req.body;

  const problem = await Problem.findOne({ pid });
  if (!problem) throw new NotFoundError('Problem not found');

  const testcase = await TestCase.create({
    problem: problem._id,
    input,
    expectedOutput,
    isSample: isSample ?? false,
    timeLimitMs: timeLimitMs ?? 2000,
  });

  return res.status(201).json({
    testcase: {
      id: String(testcase._id),
      input: testcase.input,
      expectedOutput: testcase.expectedOutput,
      isSample: testcase.isSample,
      timeLimitMs: testcase.timeLimitMs,
      createdAt: testcase.createdAt,
      updatedAt: testcase.updatedAt,
    },
  });
}

/**
 * PATCH /api/testcases/:id
 * Update a test case
 */
export async function updateTestcaseHandler(req: Request, res: Response) {
  const { id } = req.params;
  const updates = req.body;

  const testcase = await TestCase.findById(id);
  if (!testcase) throw new NotFoundError('Test case not found');

  // Update only provided fields
  if (updates.input !== undefined) testcase.input = updates.input;
  if (updates.expectedOutput !== undefined) testcase.expectedOutput = updates.expectedOutput;
  if (updates.isSample !== undefined) testcase.isSample = updates.isSample;
  if (updates.timeLimitMs !== undefined) testcase.timeLimitMs = updates.timeLimitMs;

  await testcase.save();

  return res.json({
    testcase: {
      id: String(testcase._id),
      input: testcase.input,
      expectedOutput: testcase.expectedOutput,
      isSample: testcase.isSample,
      timeLimitMs: testcase.timeLimitMs,
      createdAt: testcase.createdAt,
      updatedAt: testcase.updatedAt,
    },
  });
}

/**
 * DELETE /api/testcases/:id
 * Delete a test case
 */
export async function deleteTestcaseHandler(req: Request, res: Response) {
  const { id } = req.params;

  const testcase = await TestCase.findById(id);
  if (!testcase) throw new NotFoundError('Test case not found');

  await testcase.deleteOne();

  return res.json({
    message: 'Test case deleted successfully',
    id,
  });
}

/**
 * POST /api/testcases/bulk
 * Bulk create test cases for a problem
 */
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
