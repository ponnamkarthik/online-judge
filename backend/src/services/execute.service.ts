import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { execa } from 'execa';
import { BadRequestError } from '../utils/errors';

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'cpp' | 'java';

type ExecResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number;
};

const runners: Record<
  SupportedLanguage,
  (workDir: string) => Promise<{ build?: string[]; run: string[] }>
> = {
  javascript: async (dir) => ({ run: ['node', path.join(dir, 'main.cjs')] }),
  typescript: async (dir) => ({
    build: ['npx', 'ts-node', path.join(dir, 'main.ts')],
    run: ['npx', 'ts-node', path.join(dir, 'main.ts')],
  }),
  python: async (dir) => ({ run: ['python3', path.join(dir, 'main.py')] }),
  cpp: async (dir) => ({
    build: ['g++', '-O2', path.join(dir, 'main.cpp'), '-o', path.join(dir, 'main')],
    run: [path.join(dir, 'main')],
  }),
  java: async (dir) => ({
    build: ['javac', path.join(dir, 'Main.java')],
    run: ['java', '-cp', dir, 'Main'],
  }),
};

const fileNames: Record<SupportedLanguage, string> = {
  javascript: 'main.cjs',
  typescript: 'main.ts',
  python: 'main.py',
  cpp: 'main.cpp',
  java: 'Main.java',
};

export async function executeCode(params: {
  language: SupportedLanguage;
  code: string;
  stdin?: string;
  timeoutMs?: number;
}): Promise<ExecResult> {
  const lang = params.language;
  if (!(lang in fileNames)) throw new BadRequestError('Unsupported language');

  const timeoutMs = Math.max(500, Math.min(10000, params.timeoutMs ?? 3000));
  const workDir = path.join(process.cwd(), '.tmp', randomUUID());
  await fs.mkdir(workDir, { recursive: true });

  const file = path.join(workDir, fileNames[lang]);
  await fs.writeFile(file, params.code, 'utf-8');

  const commands = await runners[lang](workDir);

  const start = Date.now();
  try {
    if (commands.build && commands.build.length) {
      await execa(commands.build[0]!, commands.build.slice(1), {
        cwd: workDir,
        timeout: timeoutMs,
      });
    }
    const child = execa(commands.run[0]!, commands.run.slice(1), {
      cwd: workDir,
      timeout: timeoutMs,
      input: params.stdin ?? '',
    });
    const { stdout, stderr, exitCode } = await child;
    return {
      stdout,
      stderr,
      exitCode: exitCode ?? 0,
      timedOut: false,
      durationMs: Date.now() - start,
    };
  } catch (err: any) {
    const timedOut = Boolean(err.timedOut);
    const stdout: string = err.stdout ?? '';
    const stderr: string = err.stderr ?? String(err.message ?? '');
    const exitCode: number | null = typeof err.exitCode === 'number' ? err.exitCode : null;
    return { stdout, stderr, exitCode, timedOut, durationMs: Date.now() - start };
  } finally {
    // best-effort cleanup
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch {}
  }
}
