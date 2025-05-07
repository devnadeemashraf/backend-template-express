/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Enhance Types
export interface IAuthRepository {
  getUserByUsername(username: string): Promise<boolean>;
  findUsername(username: string): Promise<boolean>;
  updateUser(userId: string, data: any): Promise<void>;
}
