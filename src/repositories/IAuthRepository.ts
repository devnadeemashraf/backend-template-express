/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Enhance Types
export interface IAuthRepository {
  /**
   * Checks if the user exists based on the provided username.
   * @param username - The username to check.
   * @returns `true` if the user exists, otherwise `false`.
   */
  doesUserExistByUsername(username: string): Promise<boolean>;

  /**
   * Checks if the username is cached.
   * @param username - The username to check in the cache.
   * @returns `true` if the username is cached, otherwise `false`.
   */
  isUsernameCached(username: string): Promise<boolean>;

  /**
   * Updates a user's information based on their unique user ID.
   * @param userId - The ID of the user to update.
   * @param updatedUserData - The new user data to save.
   */
  updateUserById(userId: string, updatedUserData: any): Promise<void>;
}
