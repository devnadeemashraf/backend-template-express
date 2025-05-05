import "dotenv/config";

/**
 * Get environment variable value with fallback
 * @description This function retrieves the value of an environment variable. If the variable is not set, it returns a fallback value.
 * @param key Environment variable key
 * @param fallback Fallback value if the environment variable is not set
 * @returns Environment variable value or fallback
 */
export default function getENV<T>(key: string, fallback: T) {
  return process.env[key] ? process.env[key] : fallback;
}
