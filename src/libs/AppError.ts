/* eslint-disable @typescript-eslint/no-explicit-any */
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES, THttpResponse } from "@/utils/httpStatusCode";
import { isProduction } from "@/utils/server";

/**
 * Base application error class
 * Extends the built-in Error class with additional properties
 */
export class AppError extends Error {
  public readonly name: string;
  public readonly httpCode: number;
  public readonly isOperational: boolean;
  public readonly statusName: THttpResponse;

  constructor(statusName: THttpResponse, description?: string, isOperational: boolean = true) {
    const httpCode = HTTP_STATUS_CODES[statusName];
    const message = description || HTTP_STATUS_MESSAGES[httpCode];
    super(message);

    this.name = statusName;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    this.statusName = statusName;

    // Only capture and maintain stack trace in development environments
    if (isProduction()) {
      // In production, hide the stack trace for security
      this.stack = undefined;
    } else {
      // Capture stack trace in non-production environments
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Not found error - used when a requested resource doesn't exist
 * HTTP Status: 404
 */
export class NotFoundError extends AppError {
  constructor(description?: string) {
    super("NOT_FOUND", description);
  }
}

/**
 * Unauthorized error - used for authentication failures
 * HTTP Status: 401
 */
export class UnauthorizedError extends AppError {
  constructor(description?: string) {
    super("UNAUTHORIZED", description);
  }
}

/**
 * Validation error - used when input validation fails
 * HTTP Status: 422
 */
export class ValidationError extends AppError {
  public readonly errors?: any;

  constructor(description?: string, errors?: any) {
    super("UNPROCESSABLE_ENTITY", description);
    this.errors = errors;
  }
}

/**
 * Forbidden error - used for permission/authorization failures
 * HTTP Status: 403
 */
export class ForbiddenError extends AppError {
  constructor(description?: string) {
    super("FORBIDDEN", description);
  }
}

/**
 * Conflict error - used for resource conflicts (e.g., duplicate entries)
 * HTTP Status: 409
 */
export class ConflictError extends AppError {
  constructor(description?: string) {
    super("CONFLICT", description);
  }
}

/**
 * Bad Request error - used for invalid input
 * HTTP Status: 400
 */
export class BadRequestError extends AppError {
  constructor(description?: string) {
    super("BAD_REQUEST", description);
  }
}

/**
 * Too Many Requests error - used for rate limiting
 * HTTP Status: 429
 */
export class TooManyRequestsError extends AppError {
  constructor(description?: string) {
    super("TOO_MANY_REQUESTS", description);
  }
}

/**
 * Server error - used for unexpected errors
 * HTTP Status: 500
 */
export class ServerError extends AppError {
  constructor(description?: string) {
    super("INTERNAL_SERVER_ERROR", description, false);
  }
}

/**
 * Not Implemented error - used for unimplemented features
 * HTTP Status: 501
 */
export class NotImplementedError extends AppError {
  constructor(description?: string) {
    super("NOT_IMPLEMENTED", description);
  }
}

/**
 * Service Unavailable error - used when a service is temporarily unavailable
 * HTTP Status: 503
 */
export class ServiceUnavailableError extends AppError {
  constructor(description?: string) {
    super("SERVICE_UNAVAILABLE", description);
  }
}

/**
 * Helper function to convert unknown errors to AppError
 * Useful for handling errors from external sources
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  return new ServerError(message);
}
