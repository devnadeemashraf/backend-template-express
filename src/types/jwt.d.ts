export interface IJWTPayload extends jwt.JwtPayload {
  id: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}
