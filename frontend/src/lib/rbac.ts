/**
 * Role-Based Access Control (RBAC) utilities
 */

import type { Role } from "@/features/auth/types";
import { UserRole } from "@/features/auth/types";

// Re-export for convenience
export { UserRole } from "@/features/auth/types";
export type { Role } from "@/features/auth/types";

export type Permission =
  | "submit_code"
  | "view_analytics"
  | "manage_problems"
  | "manage_testcases"
  | "manage_ai"
  | "manage_users";

/**
 * Role to permissions mapping based on backend RBAC implementation
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [UserRole.USER]: ["submit_code", "view_analytics"],
  [UserRole.PROBLEM_SETTER]: [
    "submit_code",
    "view_analytics",
    "manage_problems",
    "manage_testcases",
  ],
  [UserRole.ADMIN]: [
    "submit_code",
    "view_analytics",
    "manage_problems",
    "manage_testcases",
    "manage_ai",
    "manage_users",
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: Role | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role is at least a specific level
 */
export function hasRole(
  userRole: Role | undefined,
  requiredRole: Role
): boolean {
  if (!userRole) return false;

  const hierarchy: Role[] = [
    UserRole.USER,
    UserRole.PROBLEM_SETTER,
    UserRole.ADMIN,
  ];
  const userLevel = hierarchy.indexOf(userRole);
  const requiredLevel = hierarchy.indexOf(requiredRole);

  return userLevel >= requiredLevel;
}

/**
 * Get a display name for a role
 */
export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    [UserRole.USER]: "User",
    [UserRole.PROBLEM_SETTER]: "Problem Setter",
    [UserRole.ADMIN]: "Admin",
  };
  return displayNames[role];
}

/**
 * Get badge color for a role
 */
export function getRoleBadgeColor(role: Role): string {
  const colors: Record<Role, string> = {
    [UserRole.USER]: "bg-blue-500/20 text-blue-600",
    [UserRole.PROBLEM_SETTER]: "bg-purple-500/20 text-purple-600",
    [UserRole.ADMIN]: "bg-red-500/20 text-red-600",
  };
  return colors[role];
}
