import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

export function AppHeader() {
  const { toggle } = useTheme();
  const { mutateAsync: doLogout, isPending } = useLogout();
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="font-brand text-xl font-semibold tracking-tight"
        >
          CodeArena
        </Link>
        <nav className="hidden sm:flex items-center gap-4 text-sm">
          <Link to="/problems" className="hover:underline">
            Problems
          </Link>
        </nav>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={toggle}>
          Toggle theme
        </Button>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={async () => {
            try {
              await doLogout();
              navigate("/login", { replace: true });
            } catch {
              // ignore; keep user on current page
            }
          }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
