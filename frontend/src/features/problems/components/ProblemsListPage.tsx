import { useNavigate, Link } from "react-router-dom";
import { useProblems } from "@/features/problems/hooks/useProblems";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { hasPermission } from "@/lib/rbac";
import { Button } from "@/components/ui/button";

export function ProblemsListPage() {
  const { data, isLoading, isError } = useProblems(1, 20);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canManageProblems = hasPermission(user?.role, "manage_problems");

  if (isLoading) return <div className="p-6">Loading problems…</div>;
  if (isError)
    return <div className="p-6 text-red-500">Failed to load problems.</div>;

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Problems</h1>
          <p className="text-muted-foreground">Choose a problem to solve.</p>
        </div>
        {canManageProblems && (
          <Button onClick={() => navigate("/problems/create")}>
            + Create Problem
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Difficulty</th>
              <th className="py-2 pr-4">Tags</th>
              {canManageProblems && <th className="py-2 pr-4">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data?.items.map((p) => (
              <tr key={p.pid} className="border-b hover:bg-muted/40">
                <td className="py-2 pr-4">
                  <Link
                    to={`/problems/${p.pid}`}
                    className="underline hover:text-primary"
                  >
                    {p.pid}. {p.title}
                  </Link>
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={`capitalize px-2 py-1 rounded text-xs ${
                      p.difficulty === "easy"
                        ? "bg-green-500/20 text-green-600"
                        : p.difficulty === "medium"
                        ? "bg-yellow-500/20 text-yellow-600"
                        : "bg-red-500/20 text-red-600"
                    }`}
                  >
                    {p.difficulty}
                  </span>
                </td>
                <td className="py-2 pr-4 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-foreground/5 px-2 py-1 rounded-md text-xs text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                {canManageProblems && (
                  <td className="py-2 pr-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/problems/${p.pid}/edit`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/problems/${p.pid}/testcases`);
                        }}
                      >
                        Test Cases
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
