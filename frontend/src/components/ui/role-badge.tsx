import type { Role } from "@/features/auth/types";
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/rbac";

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(
        role
      )} ${className}`}
    >
      {getRoleDisplayName(role)}
    </span>
  );
}
