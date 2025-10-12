import { api } from "@/lib/api-client";

export type ExecuteTestPayload = {
  language: string; // backend expects e.g., "javascript"; we'll map from UI
  code: string;
  stdin?: string;
};

export type ExecuteTestResult = {
  result: {
    stdout: string;
    stderr: string;
    exitCode: number;
    timedOut: boolean;
    durationMs: number;
  };
};

export async function executeTest(payload: ExecuteTestPayload): Promise<ExecuteTestResult> {
  const { data } = await api.post("/api/execute/test", payload);
  return data as ExecuteTestResult;
}

export type ExecuteSubmitPayload = {
  pid: number;
  language: string; // backend expects e.g., "javascript"
  code: string;
};

export type ExecuteSubmitResult = {
  pid: number;
  total: number;
  passed: boolean;
  results: Array<{
    case: number;
    input: string;
    expected: string;
    stdout: string;
    stderr: string;
    exitCode: number;
    timedOut: boolean;
    pass: boolean;
    durationMs: number;
  }>;
};

export async function executeSubmit(payload: ExecuteSubmitPayload): Promise<ExecuteSubmitResult> {
  const { data } = await api.post("/api/execute/submit", payload);
  return data as ExecuteSubmitResult;
}
