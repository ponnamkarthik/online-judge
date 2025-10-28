import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProblem,
  listProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  bulkCreateTestCases,
  getTestCases,
  deleteTestCase,
  updateTestCase,
} from "@/features/problems/api";
import type { Problem } from "@/features/problems/types";
import type {
  CreateProblemPayload,
  UpdateProblemPayload,
  BulkTestCasesPayload,
  TestCase,
} from "@/features/problems/api";

export const PROBLEM_KEYS = {
  list: (page: number, limit: number) =>
    ["problems", "list", page, limit] as const,
  detail: (pid: number) => ["problems", "detail", pid] as const,
  testCases: (pid: number) => ["problems", "testcases", pid] as const,
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

export function useCreateProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProblemPayload) => createProblem(payload),
    onSuccess: () => {
      // Invalidate all problem lists
      queryClient.invalidateQueries({ queryKey: ["problems", "list"] });
    },
  });
}

export function useUpdateProblem(pid: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProblemPayload) => updateProblem(pid, payload),
    onSuccess: () => {
      // Invalidate the specific problem and all lists
      queryClient.invalidateQueries({ queryKey: PROBLEM_KEYS.detail(pid) });
      queryClient.invalidateQueries({ queryKey: ["problems", "list"] });
    },
  });
}

export function useDeleteProblem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pid: number) => deleteProblem(pid),
    onSuccess: () => {
      // Invalidate all problem lists
      queryClient.invalidateQueries({ queryKey: ["problems", "list"] });
    },
  });
}

export function useBulkCreateTestCases(pid: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkTestCasesPayload) => bulkCreateTestCases(payload),
    onSuccess: () => {
      // Invalidate test cases for this problem
      queryClient.invalidateQueries({ queryKey: PROBLEM_KEYS.testCases(pid) });
    },
  });
}

export function useTestCases(pid: number) {
  return useQuery({
    queryKey: PROBLEM_KEYS.testCases(pid),
    queryFn: () => getTestCases(pid),
    enabled: Number.isFinite(pid),
  });
}

export function useDeleteTestCase(pid: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testCaseId: string) => deleteTestCase(testCaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROBLEM_KEYS.testCases(pid) });
    },
  });
}

export function useUpdateTestCase(pid: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestCase }) =>
      updateTestCase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROBLEM_KEYS.testCases(pid) });
    },
  });
}
