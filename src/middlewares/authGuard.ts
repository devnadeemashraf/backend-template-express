import { Request, Response, NextFunction } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { responseHandler } from "@/helpers";
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from "@/utils/jwt";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/core/jwt";

/**
 * Authentication guard middleware
 * Verifies JWT tokens and handles token refresh flow
 */
function authGuard(req: Request, res: Response, next: NextFunction) {
  // Extract tokens from cookies
  // HTTP Only Cookies are not accessible via JavaScript, so we use cookies to store tokens
  const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];

  // No tokens provided
  if (!accessToken && !refreshToken) {
    return responseHandler.unauthorized(res, "Unauthorized: Authentication required");
  }

  // Try to validate access token first
  if (accessToken) {
    try {
      const decoded = verifyAccessToken(accessToken);

      // Attach user data to request for use in route handlers
      // TODO: Update 'user' type
      req.user = {
        id: decoded.sub as string,
        ...decoded,
      };

      // Token valid - proceed to next middleware
      return next();
    } catch (err) {
      // If error is not token expiration or no refresh token exists, handle error
      if (!(err instanceof TokenExpiredError) || !refreshToken) {
        return handleAuthError(err, res);
      }
      // Otherwise, continue to refresh token logic
    }
  }

  // Access token is either expired or doesn't exist, try refresh token
  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      // Generate new access token
      const newAccessToken = generateAccessToken({
        sub: decoded.sub,
        ...decoded,
        // Don't copy exp or iat from old token
        exp: undefined,
        iat: undefined,
      });

      // Set new access token as cookie
      // TODO: Update to use isProduction()
      res.cookie(ACCESS_TOKEN_COOKIE, newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Attach user data to request
      // TODO: Update 'user' type
      req.user = {
        id: decoded.sub as string,
        ...decoded,
      };

      // Token refreshed - proceed to next middleware
      return next();
    } catch (err) {
      return handleAuthError(err, res);
    }
  }

  // This should never be reached due to the initial check,
  // but adding as a fallback for completeness
  return responseHandler.unauthorized(res, "Unauthorized: Authentication required");
}

/**
 * Helper function to handle authentication errors
 */
function handleAuthError(err: unknown, res: Response) {
  // Clear invalid cookies
  res.clearCookie(ACCESS_TOKEN_COOKIE);
  res.clearCookie(REFRESH_TOKEN_COOKIE);

  // Format specific error messages based on error type
  let message = "Authentication failed";

  if (err instanceof TokenExpiredError) {
    message = "Session expired, please login again";
  } else if (err instanceof JsonWebTokenError) {
    message = "Invalid authentication token";
  }

  return responseHandler.unauthorized(res, message);
}

export default authGuard;
