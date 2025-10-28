import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Permission } from "@/lib/rbac";
import { hasPermission } from "@/lib/rbac";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface RequirePermissionProps {
  children: ReactNode;
  permission: Permission;
  redirectTo?: string;
}

/**
 * Route wrapper that checks if the user has the required permission.
 * If not, redirects to the specified route (default: /home).
 *
 * Note: This requires the user to already be authenticated. Use this inside
 * authenticated routes (after the ProtectedRoute wrapper in AppRouter).
 *
 * Example usage:
 * <Route path="/problems/create" element={
 *   <RequirePermission permission="manage_problems">
 *     <CreateProblemPage />
 *   </RequirePermission>
 * } />
 */
export function RequirePermission({
  children,
  permission,
  redirectTo = "/",
}: RequirePermissionProps) {
  const { user } = useAuth();

  if (!hasPermission(user?.role, permission)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
