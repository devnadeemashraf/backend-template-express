/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, RedisClientType } from "redis";

import { REDIS_URL, REDIS_TTL } from "@/core/config";

/**
 * Redis client instance
 * This is a global singleton instance of the Redis client that can be imported anywhere
 * Note: This only configures the client - it does not establish a connection
 */
const redisClient: RedisClientType = createClient({
  url: REDIS_URL,
});

/**
 * Initialize Redis connection
 * @description Establishes connection to Redis server and sets up event listeners
 * @returns Promise that resolves when connection is ready
 */
export async function connectRedis(): Promise<void> {
  try {
    // Connect to Redis if not already connected
    if (!redisClient.isOpen) {
      // Set up event listeners
      redisClient.on("error", err => {
        logger.error({ msg: "Redis client error", err });
      });

      redisClient.on("reconnecting", () => {
        logger.info("Attempting to reconnect to Redis...");
      });

      redisClient.on("connect", () => {
        logger.info("Redis client connected");
      });

      // Establish connection
      await redisClient.connect();
      logger.info("Redis connection established successfully");
    }
  } catch (error) {
    logger.error({ msg: "Failed to connect to Redis", error });
    throw error; // Rethrow to handle in bootstrap
  }
}

/**
 * Gracefully disconnect Redis client
 * @description Properly closes Redis connection to avoid resource leaks
 * @returns Promise that resolves when disconnection is complete
 */
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info("Redis connection closed gracefully");
    }
  } catch (error) {
    logger.error({ msg: "Error closing Redis connection", error });
    throw error;
  }
}

/**
 * Ping Redis server to check connection health
 * @description Useful for health checks and monitoring
 * @returns Promise resolving to "PONG" if connection is healthy
 */
export async function pingRedis(): Promise<string> {
  return redisClient.ping();
}

/**
 * Cache helper methods
 * Provides a standardized interface for common caching operations
 */
export const cache = {
  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Promise resolving to cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const data = await redisClient.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      // If JSON parsing fails, return the raw string value
      // This is useful for non-JSON values like numbers or strings
      logger.error({ msg: "Failed to parse cached data", key, error: e });
      return data as unknown as T;
    }
  },

  /**
   * Store a value in cache
   * @param key Cache key
   * @param value Value to store (will be JSON stringified)
   * @param ttlSeconds Time to live in seconds (defaults to config REDIS_TTL)
   * @returns Promise resolving to "OK" if successful
   */
  async set(key: string, value: any, ttlSeconds: number = REDIS_TTL): Promise<string | null> {
    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
    return redisClient.set(key, stringValue, {
      expiration: {
        type: "EX",
        value: ttlSeconds,
      },
    });
  },

  /**
   * Delete a value from cache
   * @param key Cache key
   * @returns Promise resolving to number of keys removed (0 or 1)
   */
  async del(key: string): Promise<number> {
    return redisClient.del(key);
  },

  /**
   * Check if a key exists
   * @param key Cache key
   * @returns Promise resolving to boolean indicating if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await redisClient.exists(key);
    return result === 1;
  },

  /**
   * Set key expiration time
   * @param key Cache key
   * @param ttlSeconds Time to live in seconds
   * @returns Promise resolving to boolean indicating success
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await redisClient.expire(key, ttlSeconds);
    return result === 1;
  },

  /**
   * Get remaining TTL for a key
   * @param key Cache key
   * @returns Promise resolving to remaining TTL in seconds, -1 if no TTL, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    return redisClient.ttl(key);
  },
};

// Export the Redis client instance as default
export default redisClient;
