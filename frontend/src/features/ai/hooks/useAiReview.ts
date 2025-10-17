import { useMutation } from "@tanstack/react-query";
import {
  aiReview,
  type AiReviewPayload,
  type AiReviewResult,
} from "@/features/ai/api";

export function useAiReview() {
  return useMutation<AiReviewResult, unknown, AiReviewPayload>({
    mutationFn: aiReview,
  });
}
