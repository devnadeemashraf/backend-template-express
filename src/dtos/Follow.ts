import { IUser } from "./User";

/**
 * Follow DTO
 * It is used to define the structure of a 'Follow' object
 * It is used to transfer data between different layers of the application
 */
export interface IFollow {
  id: number;

  followerId: number;
  followingId: number;

  follower: IUser;
  following: IUser;

  createdAt: Date;
}
