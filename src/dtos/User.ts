import { $Enums } from "prisma/generated/app-client";
import { User } from "prisma/generated/app-client";

// Helper imports
import { createDTOTransformer } from "@/utils/dto";

// Local DTOs
import { IBase } from "./Base";
import { IProfile } from "./Profile";
import { IUserSettings } from "./UserSettings";
import { IUserSession } from "./UserSession";
import { IFollow } from "./Follow";
import { IFollowRequest } from "./FollowRequest";

/**
 * User DTO
 * It is used to define the structure of a 'User' object
 * It is used to transfer data between different layers of the application
 */

export interface IUser extends IBase {
  email: string;
  username: string;
  passwordHash: string;
  status: $Enums.UserStatus;
  role: $Enums.UserRole;

  emailVerified: boolean;

  followerCount: number;
  followingCount: number;

  lastLoginAt: Date | null;

  profile: IProfile;
  settings: IUserSettings;
  sessions: IUserSession[];

  followedBy: IFollow[];
  following: IFollow[];
  followRequests: IFollowRequest[];
  sentRequests: IFollowRequest[];
}

// ----------------
// Export methods to transform User entities to DTOs for the presentation layer - in this case the API Response.
// ----------------

// UserDTO - Contains detailed information without sensitive data such as password
export const toUserDTO = createDTOTransformer<User, IUser>({
  exclude: ["passwordHash", "status"],
});

// UserPublicDTO - Contains only generic information that can shared without restrictions with the public
export const toUserPublicDTO = createDTOTransformer<User, IUser>({
  include: ["username", "firstName", "lastName", "profilePicture"],
});
