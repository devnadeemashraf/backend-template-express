import { $Enums } from "prisma/generated/app-client";
import { IBase } from "./Base";
import { IUser } from "./User";

/**
 * Follow DTO
 * It is used to define the structure of a 'Follow' object
 * It is used to transfer data between different layers of the application
 */
export interface IFollowRequest extends IBase {
  senderId: number;
  receiverId: number;

  status: $Enums.FollowRequestStatus;

  // Timestamp
  respondedAt: Date | null;

  // Relationships
  sender: IUser;
  receiver: IUser;
}
