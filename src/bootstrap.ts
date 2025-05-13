import path from "path";

import { logger } from "@/helpers";
import { BLOOM_FILTER_PATH, ENCRYPTION_KEY } from "@/core/config";
import encryption from "./libs/common/Encryption";

function registerGlobalUtils() {
  global.logger = logger;
}

async function loadBloomFilterState() {
  logger.info("Loading Bloom Filter State from disk");
  const statePath = path.join(__dirname, BLOOM_FILTER_PATH);
  const password = ENCRYPTION_KEY;

  await encryption.loadBloomFilterState(statePath, password);
  logger.info("Finished Loading Bloom Filter State from disk");
}

/**
 * Main bootstrap function that initializes the application
 */
export async function bootstrap() {
  logger.info("Starting application bootstrap process");
  // Register global utilities first
  registerGlobalUtils();

  // Load the Bloom Filter state
  await loadBloomFilterState();

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
