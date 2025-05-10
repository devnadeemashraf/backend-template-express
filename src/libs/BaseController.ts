/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import type { ValidationError } from "express-validator";

import { responseHandler } from "@/helpers";
import { IServerResponse } from "@/types/server";

/**
 * BaseController class that provides a method to validate incoming requests.
 * This class can be extended by other controllers to handle specific use cases.
 */
export abstract class BaseController {
  private useCase: string;

  /**
   * Constructor for the BaseController class.
   * Initializes the useCase property.
   */
  constructor(useCase: string) {
    this.useCase = useCase;
  }

  /**
   * Abstract method to handle the request. Derived classes must implement this.
   */
  abstract handle(request: Request, response: Response): Promise<Response<IServerResponse>>;

  /**
   * Validate incoming request body based on express-validator rules.
   * @param request - The incoming request.
   * @param response - The outgoing response.
   * @returns A response object with validation error if any.
   */
  protected async validateIncomingRequest(
    request: Request,
    response: Response,
  ): Promise<Response<IServerResponse> | null> {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      // Return validation errors as a response
      const errors = result.array().map((err: ValidationError) => ({
        type: err.type,
        message: err.msg,
      }));

      return responseHandler.validationError(
        response,
        `Request Validation Failed at - ${this.useCase}`,
        errors,
      );
    }

    return null; // No validation errors
  }

  /**
   * Centralized logging of errors for better tracking.
   * @param message - Error message
   * @param context - Context of the error (e.g., user details, request info)
   */
  protected logError(context: object = {}, message?: string) {
    logger.error({
      message: message ? message : `Unexpected Error during - ${this.useCase}`,
      context,
    });
  }
}
