import jwt from "jsonwebtoken";
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

import {
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRATION,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRATION,
} from "@/core/config";

/**
 * Generate a JWT access token
 * @param payload Data to encode in the token
 * @returns Signed JWT token string
 */
export function generateAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_ACCESS_EXPIRATION as number,
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET as Secret, options);
}

/**
 * Generate a JWT refresh token
 * @param payload Data to encode in the token
 * @returns Signed JWT token string
 */
export function generateRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRATION as number,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET as Secret, options);
}

/**
 * Verify a JWT access token
 * @param token The token to verify
 * @returns Decoded token payload or throws an error if invalid
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_ACCESS_SECRET as Secret) as JwtPayload;
}

/**
 * Verify a JWT refresh token
 * @param token The token to verify
 * @returns Decoded token payload or throws an error if invalid
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET as Secret) as JwtPayload;
}
