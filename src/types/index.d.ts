/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
import { Logger } from "@/libs/common/Logger";

declare global {
  // Global variable for logger
  // This allows us to use `global.logger` in our application without TypeScript errors
  var logger: Logger;

  // Extend Express Namespace
  // TODO: Update user object in Request interface to match your application's user object
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
