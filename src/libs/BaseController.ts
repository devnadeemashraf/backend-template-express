import { Request, Response } from "express";
import { validationResult } from "express-validator";

import { responseHandler } from "@/helpers";
import { IServerResponse } from "@/types/server";

/**
 * BaseController class that provides a method to validate incoming requests.
 * This class can be extended by other controllers to handle specific use cases.
 */
export abstract class BaseController {
  constructor() {}

  /**
   * Abstract method to handle the request and validate it.
   * @param request - The incoming request object.
   * @param response - The outgoing response object.
   * @returns A promise that resolves to a Response object or null.
   */
  protected async validateIncomingRequest(
    request: Request,
    response: Response,
    useCase: string,
  ): Promise<Response<IServerResponse> | null> {
    const result = validationResult(request);
    if (!result.isEmpty()) {
      return responseHandler.validationError(
        response,
        `${useCase} failed at validation.`,
        result.array(),
      );
    }

    return null;
  }
}
