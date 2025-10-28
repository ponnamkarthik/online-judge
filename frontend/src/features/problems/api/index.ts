import { api } from "@/lib/api-client";
import type { Paginated, Problem } from "@/features/problems/types";

export async function listProblems(
  page = 1,
  limit = 20
): Promise<Paginated<Problem>> {
  const { data } = await api.get(`/api/problems`, { params: { page, limit } });
  return data as Paginated<Problem>;
}

export async function getProblem(pid: number): Promise<{ problem: Problem }> {
  const { data } = await api.get(`/api/problems/${pid}`);
  return data as { problem: Problem };
}

export interface CreateProblemPayload {
  title: string;
  descriptionMd: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

export interface UpdateProblemPayload {
  title?: string;
  descriptionMd?: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface TestCaseWithId extends TestCase {
  id: string;
  isSample?: boolean;
  timeLimitMs?: number;
}

export interface BulkTestCasesPayload {
  pid: number;
  cases: TestCase[];
}

export async function createProblem(
  payload: CreateProblemPayload
): Promise<{ problem: Problem }> {
  const { data } = await api.post(`/api/problems`, payload);
  return data as { problem: Problem };
}

export async function updateProblem(
  pid: number,
  payload: UpdateProblemPayload
): Promise<{ problem: Problem }> {
  const { data } = await api.patch(`/api/problems/${pid}`, payload);
  return data as { problem: Problem };
}

export async function deleteProblem(pid: number): Promise<void> {
  await api.delete(`/api/problems/${pid}`);
}

export async function bulkCreateTestCases(
  payload: BulkTestCasesPayload
): Promise<{ pid: number; created: number; cases: TestCaseWithId[] }> {
  const { data } = await api.post(`/api/testcases/bulk`, payload);
  return data as { pid: number; created: number; cases: TestCaseWithId[] };
}

export async function getTestCases(
  pid: number
): Promise<{ testcases: TestCaseWithId[] }> {
  const { data } = await api.get(`/api/testcases/problem/${pid}`);
  return data as { testcases: TestCaseWithId[] };
}

export async function deleteTestCase(testCaseId: string): Promise<void> {
  await api.delete(`/api/testcases/${testCaseId}`);
}

export async function updateTestCase(
  testCaseId: string,
  payload: TestCase
): Promise<{ testCase: TestCaseWithId }> {
  const { data } = await api.patch(`/api/testcases/${testCaseId}`, payload);
  return data as { testCase: TestCaseWithId };
}
