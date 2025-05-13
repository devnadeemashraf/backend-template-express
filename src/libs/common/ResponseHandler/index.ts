/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import {
  HTTP_STATUS_CODES,
  HTTP_STATUS_MESSAGES,
  THttpResponse,
  CLIENT_ERROR,
  SUCCESS,
  SERVER_ERROR,
} from "@/utils/httpStatusCode";
import { IPaginationMeta, IServerResponse } from "@/types/server";

/**
 * ResponseHandler class provides standardized methods for API responses
 * This ensures consistency across all endpoints
 */
class ResponseHandler {
  /**
   * Send a response with specified status
   * @param res Express response object
   * @param statusName HTTP status name (e.g., OK, CREATED)
   * @param message Custom message or use default based on status code
   * @param data Optional data to include in response
   */
  respond(
    res: Response,
    statusName: THttpResponse,
    message?: string,
    data?: any,
  ): Response<IServerResponse> {
    const statusCode = HTTP_STATUS_CODES[statusName];
    const defaultMessage = HTTP_STATUS_MESSAGES[statusCode];

    const responseBody: IServerResponse = {
      status: statusCode < 400 ? "success" : "error",
      message: message || defaultMessage,
    };

    if (data !== undefined) {
      responseBody.data = data;
    }

    return res.status(statusCode).json(responseBody);
  }

  /**
   * Send a success response
   * @param res Express response object
   * @param message Success message
   * @param data Optional data to include in response
   * @param statusName HTTP status name (default: OK)
   */
  success(
    res: Response,
    message?: string,
    data?: any,
    statusName: keyof typeof SUCCESS = "OK",
  ): Response<IServerResponse> {
    return this.respond(res, statusName, message, data);
  }

  /**
   * Send an error response
   * @param res Express response object
   * @param message Error message
   * @param statusName HTTP status name (default: BAD_REQUEST)
   * @param data Optional additional error details
   */
  error(
    res: Response,
    message?: string,
    statusName: keyof typeof CLIENT_ERROR | keyof typeof SERVER_ERROR = "BAD_REQUEST",
    data?: any,
  ): Response<IServerResponse> {
    return this.respond(res, statusName, message, data);
  }

  /**
   * Send a created response (201)
   * @param res Express response object
   * @param message Custom success message or use default
   * @param data Created resource data
   */
  created(res: Response, message?: string, data?: any): Response<IServerResponse> {
    return this.respond(res, "CREATED", message, data);
  }

  /**
   * Send a no content response (204)
   * @param res Express response object
   */
  noContent(res: Response): Response<IServerResponse> {
    return res.status(HTTP_STATUS_CODES.NO_CONTENT).end();
  }

  /**
   * Send a bad request response (400)
   * @param res Express response object
   * @param message Custom error message or use default
   * @param data Additional error details
   */
  badRequest(res: Response, message?: string, data?: any): Response<IServerResponse> {
    return this.respond(res, "BAD_REQUEST", message, data);
  }

  /**
   * Send an unauthorized response (401)
   * @param res Express response object
   * @param message Custom error message or use default
   * @param data Additional error details
   */
  unauthorized(res: Response, message?: string, data?: any): Response<IServerResponse> {
    return this.respond(res, "UNAUTHORIZED", message, data);
  }

  /**
   * Send a forbidden response (403)
   * @param res Express response object
   * @param message Custom error message or use default
   * @param data Additional error details
   */
  forbidden(res: Response, message?: string, data?: any): Response<IServerResponse> {
    return this.respond(res, "FORBIDDEN", message, data);
  }

  /**
   * Send a not found response (404)
   * @param res Express response object
   * @param message Custom error message or use default
   * @param data Additional error details
   */
  notFound(res: Response, message?: string, data?: any): Response<IServerResponse> {
    return this.respond(res, "NOT_FOUND", message, data);
  }

  /**
   * Send a validation error response (422)
   * @param res Express response object
   * @param message Custom error message or use default
   * @param errors Validation errors object
   */
  validationError(res: Response, message?: string, errors?: any): Response<IServerResponse> {
    return this.respond(res, "UNPROCESSABLE_ENTITY", message, { errors });
  }

  /**
   * Send a conflict response (409)
   * @param res Express response object
   * @param message Custom error message or use default
   * @param data Additional error details
   */
  conflict(res: Response, message?: string, data?: any): Response<IServerResponse> {
    return this.respond(res, "CONFLICT", message, data);
  }

  /**
   * Send a too many requests response (429)
   * @param res Express response object
   * @param message Custom error message or use default
   * @param data Additional error details
   */
  tooManyRequests(res: Response, message?: string, data?: any): Response<IServerResponse> {
    return this.respond(res, "TOO_MANY_REQUESTS", message, data);
  }

  /**
   * Send a server error response (500)
   * @param res Express response object
   * @param message Custom error message or use default
   * @param data Additional error details
   */
  serverError(res: Response, message?: string, data?: any): Response<IServerResponse> {
    return this.respond(res, "INTERNAL_SERVER_ERROR", message, data);
  }

  /**
   * Send a not implemented response (501)
   * @param res Express response object
   * @param message Custom error message or use default
   */
  notImplemented(res: Response, message?: string): Response<IServerResponse> {
    return this.respond(res, "NOT_IMPLEMENTED", message);
  }

  /**
   * Send a service unavailable response (503)
   * @param res Express response object
   * @param message Custom error message or use default
   */
  serviceUnavailable(res: Response, message?: string): Response<IServerResponse> {
    return this.respond(res, "SERVICE_UNAVAILABLE", message);
  }

  /**
   * Send a paginated list response
   * @param res Express response object
   * @param message Success message
   * @param data Array of items
   * @param pagination Pagination metadata
   */
  paginatedList(
    res: Response,
    message: string,
    data: any[] = [],
    pagination: IPaginationMeta,
  ): Response<IServerResponse> {
    return this.success(res, message && "Pagined Response Success", {
      items: data,
      pagination,
    });
  }

  /**
   * Create pagination metadata
   * @param page Current page
   * @param limit Items per page
   * @param totalItems Total number of items
   */
  createPaginationMeta(page: number, limit: number, totalItems: number): IPaginationMeta {
    const totalPages = Math.ceil(totalItems / limit);

    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}

// Export a singleton instance
export default new ResponseHandler();
