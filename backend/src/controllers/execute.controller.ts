import type { Request, Response } from 'express';
import { z } from 'zod';
import { executeCode, type SupportedLanguage } from '../services/execute.service';
import { Problem } from '../models/problem.model';
import { TestCase } from '../models/testcase.model';
import { NotFoundError } from '../utils/errors';
import { Submission } from '../models/submission.model';

export const executeTestSchema = z.object({
  language: z.enum([
    'javascript',
    'typescript',
    'python',
    'cpp',
    'java',
  ]) as z.ZodType<SupportedLanguage>,
  code: z.string().min(1),
  stdin: z.string().default(''),
  timeoutMs: z.number().min(200).max(10000).optional(),
});

export async function executeTestHandler(
  req: Request<unknown, unknown, z.infer<typeof executeTestSchema>>,
  res: Response
) {
  const { language, code, stdin, timeoutMs } = req.body;
  const result = await executeCode({ language, code, stdin, timeoutMs });
  return res.json({ result });
}

export const executeSubmitSchema = z.object({
  pid: z.number().int().positive(),
  language: z.enum([
    'javascript',
    'typescript',
    'python',
    'cpp',
    'java',
  ]) as z.ZodType<SupportedLanguage>,
  code: z.string().min(1),
  timeoutMs: z.number().min(200).max(10000).optional(),
});

export async function executeSubmitHandler(
  req: Request<unknown, unknown, z.infer<typeof executeSubmitSchema>>,
  res: Response
) {
  const { pid, language, code, timeoutMs } = req.body;
  const problem = await Problem.findOne({ pid });
  if (!problem) throw new NotFoundError('Problem not found');
  const tests = await TestCase.find({ problem: problem._id, isSample: false }).sort({ _id: 1 });

  const results = [] as Array<{
    case: number;
    input: string;
    expected: string;
    stdout: string;
    stderr: string;
    exitCode: number | null;
    timedOut: boolean;
    pass: boolean;
    durationMs: number;
  }>;

  for (let i = 0; i < tests.length; i++) {
    const tc = tests[i]!;
    const r = await executeCode({
      language,
      code,
      stdin: tc.input,
      timeoutMs: tc.timeLimitMs ?? timeoutMs,
    });
    const norm = (s: string) => s.replace(/\r\n/g, '\n').trim();
    const pass = !r.timedOut && r.exitCode === 0 && norm(r.stdout) === norm(tc.expectedOutput);
    results.push({
      case: i + 1,
      input: tc.input,
      expected: tc.expectedOutput,
      stdout: r.stdout,
      stderr: r.stderr,
      exitCode: r.exitCode,
      timedOut: r.timedOut,
      pass,
      durationMs: r.durationMs,
    });
    if (!pass) break; // early stop on first failure
  }

  const passed = results.every((x) => x.pass) && results.length === tests.length;

  // Persist submission if user is authenticated
  const userId = (req as any).user?.id;
  if (userId) {
    try {
      await Submission.create({
        user: userId,
        problem: problem._id,
        pid,
        language,
        code,
        total: tests.length,
        passed,
        results: results.map(
          ({ case: c, stdout, stderr, exitCode, timedOut, pass, durationMs }) => ({
            case: c,
            stdout,
            stderr,
            exitCode,
            timedOut,
            pass,
            durationMs,
          })
        ),
      });
    } catch {
      // swallow persist errors; execution response should still return
    }
  }

  return res.json({ pid, total: tests.length, passed, results });
}
