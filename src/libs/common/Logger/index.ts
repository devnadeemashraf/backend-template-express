import pino from "pino";

import { LOG_LEVEL } from "@/core/config";

// TODO: Write Customer Async Logger instead of using pino
class Logger {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: LOG_LEVEL,
      transport: {
        target: "pino/file",
        options: {
          destination: 1, // Use 1 for stdout, 2 for stderr
          sync: false,
        },
      },
    });
  }

  get getLogger(): pino.Logger {
    return this.logger;
  }
}

export default new Logger();
