import { useAuth } from "@/features/auth/hooks/useAuth";
import { UserRole } from "@/lib/rbac";
import { hasPermission } from "@/lib/rbac";
import {
  useGlobalStats,
  useLeaderboard,
  useMyStats,
} from "@/features/analytics/hooks/useAnalytics";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <Card className="p-6">
      <div className="text-sm text-muted-foreground mb-1">{title}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      )}
    </Card>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: globalStats, isLoading: loadingGlobal } = useGlobalStats();
  const { data: leaderboard, isLoading: loadingLeaderboard } =
    useLeaderboard(10);
  const { data: myStats, isLoading: loadingMyStats } = useMyStats(
    Boolean(user)
  );

  const isLoading = loadingGlobal || loadingLeaderboard || loadingMyStats;

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.username ?? user?.email}!
        </h1>
        <p className="text-muted-foreground">
          Track your progress and compete with others.
        </p>
      </div>

      {/* My Stats */}
      {myStats && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Problems Solved"
              value={myStats.overview.problemsSolved}
              subtitle={`out of ${
                globalStats?.overview.totalProblems ?? "?"
              } total`}
            />
            <StatCard
              title="Success Rate"
              value={myStats.overview.successRate}
              subtitle={`${myStats.overview.totalSubmissions} submissions`}
            />
            <StatCard
              title="Languages Used"
              value={myStats.languageStats.length}
            />
          </div>

          {/* Language Breakdown */}
          {myStats.languageStats.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Language Breakdown</h3>
              <div className="space-y-3">
                {myStats.languageStats.map((lang) => (
                  <div
                    key={lang.language}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium capitalize">
                        {lang.language}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {lang.passed}/{lang.total} passed
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      {lang.successRate}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Submissions */}
          {myStats.recentSubmissions.length > 0 && (
            <Card className="p-6 mt-4">
              <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>
              <div className="space-y-2">
                {myStats.recentSubmissions.slice(0, 5).map((sub, idx) => (
                  <Link
                    key={idx}
                    to={`/problems/${sub.pid}`}
                    className="flex items-center justify-between p-3 rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Problem #{sub.pid}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-muted capitalize">
                        {sub.language}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          sub.passed
                            ? "bg-green-500/20 text-green-600"
                            : "bg-red-500/20 text-red-600"
                        }`}
                      >
                        {sub.passed ? "Passed" : "Failed"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </section>
      )}

      {/* Platform Overview - Only for admin and problem_setter roles */}
      {globalStats &&
        (user?.role === UserRole.ADMIN ||
          user?.role === UserRole.PROBLEM_SETTER) && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Users"
                value={globalStats.overview.totalUsers}
              />
              <StatCard
                title="Total Problems"
                value={globalStats.overview.totalProblems}
              />
              <StatCard
                title="Total Submissions"
                value={globalStats.overview.totalSubmissions}
              />
              <StatCard
                title="Global Success Rate"
                value={globalStats.overview.globalSuccessRate}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Problems by Difficulty */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Problems by Difficulty
                </h3>
                <div className="space-y-3">
                  {globalStats.problemsByDifficulty.map((item) => (
                    <div
                      key={item.difficulty}
                      className="flex items-center justify-between"
                    >
                      <span
                        className={`capitalize font-medium ${
                          item.difficulty === "easy"
                            ? "text-green-600"
                            : item.difficulty === "medium"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.difficulty}
                      </span>
                      <span className="text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Language Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Popular Languages
                </h3>
                <div className="space-y-3">
                  {globalStats.languageDistribution
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map((item) => (
                      <div
                        key={item.language}
                        className="flex items-center justify-between"
                      >
                        <span className="capitalize font-medium">
                          {item.language}
                        </span>
                        <span className="text-muted-foreground">
                          {item.count}
                        </span>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          </section>
        )}

      {/* Leaderboard */}
      {leaderboard && leaderboard.leaderboard.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
          <Card className="p-6">
            <div className="space-y-3">
              {leaderboard.leaderboard.map((entry, idx) => (
                <div
                  key={entry.email}
                  className={`flex items-center justify-between p-3 rounded ${
                    entry.email === user?.email
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-lg font-bold ${
                        idx === 0
                          ? "text-yellow-600"
                          : idx === 1
                          ? "text-gray-400"
                          : idx === 2
                          ? "text-amber-700"
                          : "text-muted-foreground"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-medium">{entry.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.email === user?.email ? "(You)" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {entry.problemsSolved} solved
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.totalSubmissions} submissions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/problems"
              className="px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Browse Problems
            </Link>
            {hasPermission(user?.role, "manage_problems") && (
              <Button onClick={() => navigate("/problems/create")}>
                + Create Problem
              </Button>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
