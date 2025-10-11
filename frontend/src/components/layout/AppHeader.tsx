import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function AppHeader() {
  const { toggle } = useTheme();
  const { mutateAsync: doLogout, isPending } = useLogout();
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <div className="font-brand text-xl font-semibold tracking-tight">
        CodeArena
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
