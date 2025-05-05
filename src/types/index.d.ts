/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
import { Logger } from "pino";

declare global {
  // Global variable for logger
  // This allows us to use `global.logger` in our application without TypeScript errors
  var logger: Logger;

  // Extend Express Namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}

export {};
