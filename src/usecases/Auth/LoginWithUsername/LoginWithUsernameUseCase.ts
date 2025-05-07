/* eslint-disable @typescript-eslint/no-unused-vars */

import { IAuthRepository } from "@/repositories";

import { ILoginWithUsernameUseCaseRequest } from "./LoginWithUsernameDTO";

// TODO: Update the Logic Properly
export class LoginWithUsernameUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(data: ILoginWithUsernameUseCaseRequest): Promise<void> {
    const { username, password } = data;

    // If either of the username or password is not provided, throw an error
    if (!username || !password) {
      throw new Error("Username and password are required.");
    }

    // Try Fetching Username from Database using the Repository
    const user = await this.authRepository.getUserByUsername(username);
    // Check if the username and password are valid
    if (!user) {
      throw new Error("Username not found.");
    }

    // Check if the password is valid
    const passwordValid = await this.isPasswordValid(password);
    if (!passwordValid) {
      throw new Error("Invalid password.");
    }

    // Login User - Create a new User session and returnt he session details
    const session = await this.createSession();

    // Returnt the Result
    return;
  }

  private async isUsernameTaken(username: string): Promise<boolean> {
    // Add logic to check if the username is taken
    // Use concept such as - bloom filter, redis layer, etc.
    return true;
  }

  private async isPasswordValid(password: string): Promise<boolean> {
    // Add logic to check if the password is valid
    return true;
  }

  private async createSession(): Promise<void> {
    // Add logic to create a session for the user
    // Do everything that needs to be done
    // Finally update the Database entry for the user
    // to reflect the new session details

    // Update the Databse Entry for the User
    await this.authRepository.updateUser("123", {});

    // Returnt the Updated Session to the 'execute' method
    return;
  }
}
