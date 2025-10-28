import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  executeSubmit,
  executeTest,
  getMySubmissions,
  type ExecuteSubmitPayload,
  type ExecuteSubmitResult,
  type ExecuteTestPayload,
  type ExecuteTestResult,
  type MySubmissionsResult,
} from "@/features/execute/api";

export function useExecuteTest() {
  return useMutation<ExecuteTestResult, unknown, ExecuteTestPayload>({
    mutationFn: executeTest,
  });
}

export function useExecuteSubmit() {
  const qc = useQueryClient();
  return useMutation<ExecuteSubmitResult, unknown, ExecuteSubmitPayload>({
    mutationFn: executeSubmit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["execute", "my-submissions"] });
    },
  });
}

export function useMySubmissions(enabled = true) {
  return useQuery<MySubmissionsResult>({
    queryKey: ["execute", "my-submissions"],
    queryFn: getMySubmissions,
    enabled,
    staleTime: 60_000,
  });
}
