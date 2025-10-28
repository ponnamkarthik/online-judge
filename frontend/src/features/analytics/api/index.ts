import { api } from "@/lib/api-client";

export type GlobalStats = {
  overview: {
    totalUsers: number;
    totalProblems: number;
    totalSubmissions: number;
    globalSuccessRate: string;
  };
  problemsByDifficulty: Array<{ difficulty: string; count: number }>;
  languageDistribution: Array<{ language: string; count: number }>;
  recentActivity: Array<{ date: string; submissions: number; passed: number }>;
};

export type LeaderboardEntry = {
  username: string;
  email: string;
  problemsSolved: number;
  totalSubmissions: number;
};

export type Leaderboard = {
  leaderboard: LeaderboardEntry[];
};

export type ProblemStats = {
  problem: {
    pid: number;
    title: string;
    difficulty: string;
    tags: string[];
  };
  stats: {
    totalSubmissions: number;
    uniqueUsers: number;
    acceptanceRate: string;
  };
  successDistribution: { passed: number; failed: number };
  languageStats: Array<{
    language: string;
    submissions: number;
    passed: number;
  }>;
};

export type MyStats = {
  overview: {
    totalSubmissions: number;
    problemsSolved: number;
    successRate: string;
  };
  languageStats: Array<{
    language: string;
    total: number;
    passed: number;
    successRate: string;
  }>;
  recentSubmissions: Array<{
    pid: number;
    language: string;
    passed: boolean;
    createdAt: string;
  }>;
};

export async function getGlobalStats(): Promise<GlobalStats> {
  const { data } = await api.get("/api/analytics/global");
  return data;
}

export async function getLeaderboard(limit = 10): Promise<Leaderboard> {
  const { data } = await api.get("/api/analytics/leaderboard", {
    params: { limit },
  });
  return data;
}

export async function getProblemStats(pid: number): Promise<ProblemStats> {
  const { data } = await api.get(`/api/analytics/problem/${pid}`);
  return data;
}

export async function getMyStats(): Promise<MyStats> {
  const { data } = await api.get("/api/analytics/me");
  return data;
}
