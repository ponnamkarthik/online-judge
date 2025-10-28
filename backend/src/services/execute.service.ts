import { env } from '../lib/env';
import { BadRequestError } from '../utils/errors';

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'cpp' | 'java';

type ExecResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number;
};

// Delegates code execution to the external compiler microservice
export async function executeCode(params: {
  language: SupportedLanguage;
  code: string;
  stdin?: string;
  timeoutMs?: number;
}): Promise<ExecResult> {
  const { language, code, stdin, timeoutMs } = params;
  const allowed: SupportedLanguage[] = ['javascript', 'typescript', 'python', 'cpp', 'java'];
  if (!allowed.includes(language)) throw new BadRequestError('Unsupported language');

  const base = env.COMPILER_URL ?? 'http://localhost:5001';
  const url = `${base.replace(/\/$/, '')}/execute`;

  console.log(url);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, code, stdin: stdin ?? '', timeoutMs }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new BadRequestError(`Compiler service error (${res.status}): ${text || res.statusText}`);
  }
  const data = (await res.json()) as { result: ExecResult };
  console.log(data);
  return data.result;
}
