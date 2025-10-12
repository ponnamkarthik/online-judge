import { useNavigate, Link } from "react-router-dom";
import { useProblems } from "@/features/problems/hooks/useProblems";

export function ProblemsListPage() {
  const { data, isLoading, isError } = useProblems(1, 20);
  const navigate = useNavigate();

  if (isLoading) return <div className="p-6">Loading problems…</div>;
  if (isError)
    return <div className="p-6 text-red-500">Failed to load problems.</div>;

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Problems</h1>
        <p className="text-muted-foreground">Choose a problem to solve.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Difficulty</th>
              <th className="py-2 pr-4">Tags</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((p) => (
              <tr
                key={p.pid}
                className="border-b hover:bg-muted/40 cursor-pointer"
                onClick={() => navigate(`/problems/${p.pid}`)}
              >
                <td className="py-2 pr-4">
                  <Link to={`/problems/${p.pid}`} className="underline">
                    {p.pid}. {p.title}
                  </Link>
                </td>
                <td className="py-2 pr-4 capitalize">{p.difficulty}</td>
                <td className="py-2 pr-4 text-sm flex flex-wrap gap-2 text-muted-foreground">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-foreground/5 px-2 py-1 rounded-md text-xs text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
