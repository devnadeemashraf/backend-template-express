import { UserRole } from "prisma/generated/app-client";

/**
 * Role-based access control types
 */
export type TResource = string;
export type TAction = "create" | "read" | "update" | "delete" | "manage" | string;

/**
 * Permission definition interfaces
 */
interface IPermission {
  resource: TResource;
  actions: TAction[];
}

interface IRoleDefinition {
  permissions: IPermission[];
  inherits?: UserRole[];
}
