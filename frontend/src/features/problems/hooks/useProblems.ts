import { useQuery } from "@tanstack/react-query";
import { getProblem, listProblems } from "@/features/problems/api";
import type { Problem } from "@/features/problems/types";

export const PROBLEM_KEYS = {
  list: (page: number, limit: number) =>
    ["problems", "list", page, limit] as const,
  detail: (pid: number) => ["problems", "detail", pid] as const,
};

export function useProblems(page = 1, limit = 20) {
  return useQuery({
    queryKey: PROBLEM_KEYS.list(page, limit),
    queryFn: () => listProblems(page, limit),
  });
}

export function useProblem(pid: number) {
  return useQuery<{ problem: Problem }>({
    queryKey: PROBLEM_KEYS.detail(pid),
    queryFn: () => getProblem(pid),
    enabled: Number.isFinite(pid),
  });
}
