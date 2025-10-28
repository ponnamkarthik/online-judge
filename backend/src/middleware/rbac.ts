import type { NextFunction, Request, Response } from 'express';

import { Role } from '../models/role.model';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * RBAC Middleware - Permission-based authorization
 * Usage: authorize(['manage_problems', 'manage_testcases'])
 *
 * @param requiredPermissions - Array of permission strings required to access the route
 * @returns Express middleware function
 *
 * Example:
 * router.post('/problems', requireAuth, authorize(['manage_problems']), createProblemHandler);
 */
export function authorize(requiredPermissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Ensure user is authenticated
      const user = (req as any).user;
      if (!user || !user.id || !user.role) {
        return next(new UnauthorizedError('Authentication required'));
      }

      // Fetch role and permissions from database
      const role = await Role.findOne({ name: user.role }).lean();
      if (!role) {
        return next(new ForbiddenError('Invalid role assigned to user'));
      }

      // Check if user has at least one of the required permissions
      const hasPermission = requiredPermissions.some((permission) =>
        role.permissions.includes(permission)
      );

      if (!hasPermission) {
        return next(
          new ForbiddenError(
            `Access denied. Required permissions: ${requiredPermissions.join(' or ')}`
          )
        );
      }

      // User has permission, proceed
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

/**
 * Helper function to check if user has specific role
 * Usage: requireRole(['admin', 'problem_setter'])
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.role) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(
        new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(' or ')}`)
      );
    }

    return next();
  };
}
