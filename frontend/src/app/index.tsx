import { AppRouter } from "@/app/router/AppRouter";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_KEYS } from "@/features/auth/hooks/useAuth";
import { getCurrentUser as getCurrentUserApi } from "@/features/auth/api";
import type { User } from "@/features/auth/types";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  // Ensure we try /me once on cold start to hydrate auth if cookies exist
  const { isLoading } = useAuth();
  const qc = useQueryClient();
  const triedRef = useRef(false);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    if (triedRef.current) return;
    triedRef.current = true;
    qc.fetchQuery<User>({
      queryKey: AUTH_KEYS.currentUser,
      queryFn: getCurrentUserApi,
      retry: 0,
    }).finally(() => setBootDone(true));
  }, [qc]);

  if (!bootDone && isLoading) return <div className="p-6">Loading...</div>;
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
