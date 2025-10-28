import { useQuery } from "@tanstack/react-query";
import {
  getGlobalStats,
  getLeaderboard,
  getProblemStats,
  getMyStats,
} from "@/features/analytics/api";

export const ANALYTICS_KEYS = {
  global: ["analytics", "global"] as const,
  leaderboard: (limit: number) => ["analytics", "leaderboard", limit] as const,
  problem: (pid: number) => ["analytics", "problem", pid] as const,
  myStats: ["analytics", "my-stats"] as const,
};

export function useGlobalStats() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.global,
    queryFn: getGlobalStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.leaderboard(limit),
    queryFn: () => getLeaderboard(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useProblemStats(pid: number) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.problem(pid),
    queryFn: () => getProblemStats(pid),
    enabled: Number.isFinite(pid),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyStats(enabled = true) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.myStats,
    queryFn: getMyStats,
    staleTime: 60 * 1000, // 1 minute
    enabled,
  });
}
