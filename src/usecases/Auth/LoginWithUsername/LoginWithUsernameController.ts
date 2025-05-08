import { Request, Response } from "express";

import { responseHandler } from "@/helpers";
import { BaseController } from "@/libs";
import { NotFoundError, UnauthorizedError, ValidationError } from "@/libs/AppError";

import { LoginWithUsernameUseCase } from "./LoginWithUsernameUseCase";

export class LoginWithUsernameController extends BaseController {
  useCase: string;

  constructor(private loginWithUsernameUseCase: LoginWithUsernameUseCase) {
    super();
    this.useCase = "Login with Username";
  }

  async handle(request: Request, response: Response): Promise<Response> {
    // Validate the incoming request
    const validationErrorResponse = await this.validateIncomingRequest(
      request,
      response,
      this.useCase,
    );
    // If there are validation errors, return the response and stop further processing
    if (validationErrorResponse) {
      return validationErrorResponse;
    }

    // Extract the username and password from the request body after validation
    const { username, password } = request.body;

    try {
      // Call the LoginWithUsernameUseCase to handle the Business Logic
      // and return the result to the client

      const data = await this.loginWithUsernameUseCase.execute({
        username,
        password,
      });

      return responseHandler.created(response, "User logged in successfully.", data);
    } catch (err) {
      // Handle specific error types
      if (err instanceof UnauthorizedError) {
        return responseHandler.unauthorized(response, err.message);
      } else if (err instanceof ValidationError) {
        return responseHandler.validationError(response, err.message);
      } else if (err instanceof NotFoundError) {
        return responseHandler.notFound(response, err.message);
      } else {
        // Log unexpected errors
        logger.error({
          useCase: this.useCase,
          error: err,
          context: { username },
        });
        return responseHandler.serverError(response, "An unexpected error occurred during login");
      }
    }
  }
}
