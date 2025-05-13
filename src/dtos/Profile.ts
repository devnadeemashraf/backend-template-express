import { $Enums } from "prisma/generated/app-client";

import { IBase } from "./Base";
import { IUser } from "./User";

/**
 * Profile DTO
 * It is used to define the structure of a Profile object
 * It is used to transfer data between different layers of the application
 */

export interface IProfile extends IBase {
  userId: string;

  firstName: string;
  lastName: string;
  bio: string;
  avatar: string;
  phone: string;
}

export interface IProfileWithRelation extends IProfile {
  user: IUser;
}
