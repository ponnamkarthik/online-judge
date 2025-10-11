import { AppRouter } from "@/app/router/AppRouter";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  if (isLoading) return <div className="p-6">Loading...</div>;
  return <>{children}</>;
}

export function AppRoot() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthBootstrap>
          <AppRouter />
        </AuthBootstrap>
      </ThemeProvider>
    </QueryProvider>
  );
}
