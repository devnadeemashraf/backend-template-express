import { Request, Response, NextFunction } from "express";
import { UserRole } from "prisma/generated/app-client";

import { ROLES } from "@/core/rbac";

import { TAction, TResource } from "@/types/rbac";
import { responseHandler } from "@/helpers";

// Cache for resolved permissions to improve performance
// This is a simple in-memory cache for permissions
// TODO: Implement Redis cache for permissions
const permissionsCache = new Map<string, boolean>();

/**
 * Check if a role has a specific permission
 */
function hasPermission(
  role: UserRole,
  resource: TResource,
  action: TAction,
  visited = new Set<UserRole>(),
): boolean {
  // Prevent circular inheritance
  if (visited.has(role)) return false;
  visited.add(role);

  // Generate cache key
  const cacheKey = `${role}:${resource}:${action}`;

  // Check cache first
  if (permissionsCache.has(cacheKey)) {
    return permissionsCache.get(cacheKey) as boolean;
  }

  const roleDefinition = ROLES[role];
  if (!roleDefinition) return false;

  // Check direct permissions
  const hasDirectPermission = roleDefinition.permissions.some(permission => {
    // Wildcard resource check
    if (permission.resource === "*") {
      return permission.actions.includes("manage") || permission.actions.includes(action);
    }

    // Specific resource check
    return (
      permission.resource === resource &&
      (permission.actions.includes(action) || permission.actions.includes("manage"))
    );
  });

  if (hasDirectPermission) {
    permissionsCache.set(cacheKey, true);
    return true;
  }

  // Check inherited roles
  const hasInheritedPermission =
    roleDefinition.inherits?.some(inheritedRole =>
      hasPermission(inheritedRole, resource, action, visited),
    ) ?? false;

  // Cache the result
  permissionsCache.set(cacheKey, hasInheritedPermission);
  return hasInheritedPermission;
}

/**
 * RBAC middleware factory
 * Creates a middleware that checks if the user has permission to perform an action on a resource
 */
function rbac(resource: TResource, action: TAction) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user || !req.user.role) {
      return responseHandler.unauthorized(res, "Authentication required");
    }

    const userRole = req.user.role as UserRole;

    // Check permission
    if (hasPermission(userRole, resource, action)) {
      return next();
    }

    // Permission denied
    return responseHandler.forbidden(res, "Permission denied");
  };
}

/**
 * Export the middleware factory and helper functions
 */
export { hasPermission };
export default rbac;
