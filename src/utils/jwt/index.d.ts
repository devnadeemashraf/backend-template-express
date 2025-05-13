import { JwtPayload } from "jsonwebtoken";

/**
 * JWT Payload Interface for Application
 */
export interface IJWTPayload extends JwtPayload {
  id: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}
