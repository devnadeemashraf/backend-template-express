/* eslint-disable @typescript-eslint/no-unused-vars */
import { IAuthRepository } from "@/repositories";

import { ILoginWithUsernameUseCaseRequest } from "./LoginWithUsernameDTO";

// TODO: Update the Logic Properly
export class LoginWithUsernameUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(data: ILoginWithUsernameUseCaseRequest): Promise<void> {
    const { username, password } = data;

    // If Username is empty, throw an error
    if (!username) {
      throw new Error("Username cannot be empty.");
    }

    // If Password is empty, throw an error
    if (!password) {
      throw new Error("Password cannot be empty.");
    }

    // Try Fetching Username from Database using the Repository
    const isUsernameInDatabase = await this.isUsernameTaken(username);
    // Check if the username and password are valid
    if (!isUsernameInDatabase) {
      throw new Error("Username not found.");
    }

    // Check if the password is valid
    const passwordValid = await this.isPasswordValid(password);
    if (!passwordValid) {
      throw new Error("Invalid password.");
    }

    // Login User - Create a new User session and returnt he session details
    const session = await this.createNewUserSession();

    // Returnt the Result
    return;
  }

  private async isUsernameTaken(username: string): Promise<boolean> {
    // Add logic to check if the username is taken
    // Use concept such as - bloom filter, redis layer, etc.
    const user = await this.authRepository.doesUserExistByUsername(username);
    return true;
  }

  private async isPasswordValid(password: string): Promise<boolean> {
    // Add logic to check if the password is valid
    return true;
  }

  private async createNewUserSession(): Promise<void> {
    // Add logic to create a session for the user
    // Do everything that needs to be done
    // Finally update the Database entry for the user
    // to reflect the new session details

    // Update the Databse Entry for the User
    await this.authRepository.updateUserById("123", {});

    // Returnt the Updated Session to the 'execute' method
    return;
  }
}
