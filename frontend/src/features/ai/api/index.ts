import { api } from "@/lib/api-client";

export type AiReviewPayload = {
  language: string;
  code: string;
  prompt?: string;
};

export type AiReviewResult = {
  advice: string;
};

export async function aiReview(
  payload: AiReviewPayload
): Promise<AiReviewResult> {
  const { data } = await api.post("/api/ai/review", payload);
  return data as AiReviewResult;
}
