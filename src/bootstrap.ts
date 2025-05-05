import { logger } from "./helpers";

function registerGlobalUtils() {
  global.logger = logger;
}

/**
 * Main bootstrap function that initializes the application
 */
export function bootstrap() {
  logger.info("Starting application bootstrap process");

  // Register global utilities first
  registerGlobalUtils();

  // Initialize any required services
  // This can be expanded as needed

  logger.info("Application bootstrap completed successfully");

  return {
    // Return anything that might be needed by the caller
  };
}

/**
 * Add additional bootstrapping processes as needed
 * Each process can be added as a function here
 */
export const bootstrapProcesses = {
  registerGlobalUtils,

  // Add more bootstrapping processes here as your application grows
  // Example: registerService, initializeDatabases, setupMiddleware, configureAuth, etc.
};
