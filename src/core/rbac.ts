import { UserRole } from "prisma/generated/app-client";
import { IRoleDefinition } from "@/types/rbac";

/**
 * RBAC permissions map - defines what each role can do
 * This is just a starting point and can be extended/updated as needed
 * The permissions are defined in a way that allows for easy inheritance and overrides
 * TODO: Update 'resource' and 'actions' to match the actual resources and actions in your application.
 */
const ROLES: Record<UserRole, IRoleDefinition> = {
  ADMIN: {
    inherits: ["MODERATOR"],
    permissions: [
      { resource: "*", actions: ["manage"] }, // Wildcard for all resources
    ],
  },
  MODERATOR: {
    inherits: ["USER"],
    permissions: [
      { resource: "posts", actions: ["update", "delete"] },
      { resource: "comments", actions: ["update", "delete"] },
      { resource: "users", actions: ["read"] },
    ],
  },
  USER: {
    inherits: [],
    permissions: [
      { resource: "profile", actions: ["read", "update"] },
      { resource: "posts", actions: ["read", "create"] },
      { resource: "comments", actions: ["read", "create", "update", "delete"] },
    ],
  },
  // Sample Role for future use
  // Uncomment and modify as needed
  // GUEST: {
  //   inherits: [],
  //   permissions: [
  //     { resource: "posts", actions: ["read"] },
  //     { resource: "comments", actions: ["read"] },
  //   ],
  // },
};

export { ROLES };
