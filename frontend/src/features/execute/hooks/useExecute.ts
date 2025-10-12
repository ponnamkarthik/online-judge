import { useMutation } from "@tanstack/react-query";
import {
  executeSubmit,
  executeTest,
  type ExecuteSubmitPayload,
  type ExecuteSubmitResult,
  type ExecuteTestPayload,
  type ExecuteTestResult,
} from "@/features/execute/api";

export function useExecuteTest() {
  return useMutation<ExecuteTestResult, unknown, ExecuteTestPayload>({
    mutationFn: executeTest,
  });
}

export function useExecuteSubmit() {
  return useMutation<ExecuteSubmitResult, unknown, ExecuteSubmitPayload>({
    mutationFn: executeSubmit,
  });
}
