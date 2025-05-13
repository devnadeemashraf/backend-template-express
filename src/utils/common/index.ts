/**
 * Check if the application is running in production mode.
 * This is determined by the `NODE_ENV` environment variable.
 * @returns `true` if the application is running in production mode, otherwise `false`.
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
