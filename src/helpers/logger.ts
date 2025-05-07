import pino from "pino";

import { LOG_LEVEL } from "@/core/config";

// TODO: Improve the Logger
// 1 - Add a transport layer to send logs to a file or external service
// 2 - Configure to flush logs regularly for no clogging of memory
// 3 - Add a way to filter logs by level (info, warn, error, etc.)
// 4 - Add a way to format logs (JSON, plain text, etc.)
const logger = pino({
  level: LOG_LEVEL,
  transport: {
    target: "pino/file",
    options: {
      destination: 1, // Use 1 for stdout, 2 for stderr
      sync: false,
    },
  },
});

export default logger;
export type TLogger = typeof logger;
