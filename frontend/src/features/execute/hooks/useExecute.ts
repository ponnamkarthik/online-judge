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
      qc.invalidateQueries({ queryKey: ["execute", "my"] });
    },
  });
}

export function useMySubmissions() {
  return useQuery<MySubmissionsResult>({
    queryKey: ["execute", "my"],
    queryFn: getMySubmissions,
  });
}
