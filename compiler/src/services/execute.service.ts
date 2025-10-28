import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { execa } from "execa";

import { BadRequestError } from "../utils/errors";

export type SupportedLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "cpp"
  | "java";

export type ExecResult = {
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
  // Run JS directly with node
  javascript: async (dir) => ({ run: ["node", path.join(dir, "main.cjs")] }),
  // For TS, avoid running twice – just execute with ts-node (no separate build step)
  typescript: async (dir) => ({
    run: ["npx", "ts-node", path.join(dir, "main.ts")],
  }),
  // Python interpreter
  python: async (dir) => ({ run: ["python3", path.join(dir, "main.py")] }),
  // C++: compile then run
  cpp: async (dir) => ({
    build: [
      "g++",
      "-O2",
      path.join(dir, "main.cpp"),
      "-o",
      path.join(dir, "main"),
    ],
    run: [path.join(dir, "main")],
  }),
  // Java: compile then run
  java: async (dir) => ({
    build: ["javac", path.join(dir, "Main.java")],
    run: ["java", "-cp", dir, "Main"],
  }),
};

const fileNames: Record<SupportedLanguage, string> = {
  javascript: "main.cjs",
  typescript: "main.ts",
  python: "main.py",
  cpp: "main.cpp",
  java: "Main.java",
};

export async function executeCode(params: {
  language: SupportedLanguage;
  code: string;
  stdin?: string;
  timeoutMs?: number;
}): Promise<ExecResult> {
  const lang = params.language;
  if (!(lang in fileNames)) throw new BadRequestError("Unsupported language");

  // Clamp timeout, default to 3s
  const timeoutMs = Math.max(500, Math.min(10000, params.timeoutMs ?? 3000));
  const workDir = path.join(process.cwd(), ".tmp", randomUUID());
  await fs.mkdir(workDir, { recursive: true });

  const file = path.join(workDir, fileNames[lang]);
  await fs.writeFile(file, params.code, "utf-8");

  const commands = await runners[lang](workDir);

  // Helper to run a command with a hard timeout and safe kill
  const runWithTimeout = async (
    cmd: string,
    args: string[],
    opts: { input?: string; cwd: string; timeoutMs: number }
  ): Promise<ExecResult> => {
    const start = Date.now();
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), opts.timeoutMs);
    try {
      const child = execa(cmd, args, {
        cwd: opts.cwd,
        input: opts.input ?? "",
        cancelSignal: ac.signal,
        // Safety valves to avoid hangs and output explosions
        cleanup: true,
        killSignal: "SIGKILL",
        timeout: opts.timeoutMs, // double-guard: execa's internal timeout + AbortController
        maxBuffer: 1024 * 1024, // 1MB
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
      const timedOut = ac.signal.aborted || Boolean(err.timedOut);
      const stdout: string = err.stdout ?? "";
      const stderr: string = err.stderr ?? String(err.message ?? "");
      const exitCode: number | null =
        typeof err.exitCode === "number" ? err.exitCode : null;
      return {
        stdout,
        stderr,
        exitCode,
        timedOut,
        durationMs: Date.now() - start,
      };
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    // Compile/build step for compiled languages
    if (commands.build && commands.build.length) {
      const [b0, ...bRest] = commands.build;
      const buildRes = await runWithTimeout(b0!, bRest, {
        cwd: workDir,
        timeoutMs,
      });
      if (
        buildRes.timedOut ||
        (typeof buildRes.exitCode === "number" && buildRes.exitCode !== 0)
      ) {
        return buildRes; // Return compile errors/timeouts directly
      }
    }

    // Run step
    const [r0, ...rRest] = commands.run;
    const runRes = await runWithTimeout(r0!, rRest, {
      cwd: workDir,
      timeoutMs,
      input: params.stdin ?? "",
    });
    return runRes;
  } finally {
    // best-effort cleanup
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch {}
  }
}
