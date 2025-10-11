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
