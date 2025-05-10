import { Request, Response } from "express";

import { BaseController } from "@/libs";
import { responseHandler } from "@/helpers";
import { NotFoundError, UnauthorizedError, ValidationError } from "@/libs/AppError";

import { IServerResponse } from "@/types/server";

import { HealthCheckUseCase } from "./HealthCheckUseCase";

export class HealthCheckController extends BaseController {
  constructor(private healthCheckUseCase: HealthCheckUseCase) {
    super("Health Check");
  }

  async handle(_: Request, response: Response): Promise<Response<IServerResponse>> {
    try {
      const data = await this.healthCheckUseCase.execute();

      return responseHandler.success(response, data.message, {
        status: data.status,
        timestamp: data.currentTime,
      });
    } catch (err) {
      // Log the error for tracking and debugging
      this.logError({ error: err });

      // Handle specific error types
      if (err instanceof UnauthorizedError) {
        return responseHandler.unauthorized(response, err.message);
      } else if (err instanceof ValidationError) {
        return responseHandler.validationError(response, err.message);
      } else if (err instanceof NotFoundError) {
        return responseHandler.notFound(response, err.message);
      } else {
        return responseHandler.serverError(response, (err as Error).message);
      }
    }
  }
}
