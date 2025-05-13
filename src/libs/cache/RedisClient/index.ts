/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, RedisClientType } from "redis";

import { REDIS_URL, REDIS_TTL } from "@/core/config";

import { ERedisConnectionState, IRedisClientConfig, ICacheOptions } from "./types";
import { AppError } from "@/libs/common/AppError";

/**
 * Redis client class that provides a typed interface for Redis operations
 * Implements a singleton pattern with dependency injection capabilities
 */
export class RedisClient {
  private client: RedisClientType;

  private _state: ERedisConnectionState = ERedisConnectionState.DISCONNECTED;
  private _config: Required<IRedisClientConfig>;

  private connectionPromise: Promise<void> | null = null;

  private retryCount = 0;
  private readonly DEFAULT_CONFIG: Required<IRedisClientConfig> = {
    url: REDIS_URL,
    defaultTtl: REDIS_TTL,
    maxRetries: 5,
    retryDelay: 1000,
    logLevel: "info",
  };

  /**
   * Creates a new RedisClient instance
   * @param config - Configuration options for Redis client
   */
  constructor(config: IRedisClientConfig = {}) {
    // Merge default config with provided config
    this._config = {
      ...this.DEFAULT_CONFIG,
      ...config,
    };

    // Create Redis client
    this.client = createClient(this._config) as RedisClientType;

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Current connection state
   */
  get state(): ERedisConnectionState {
    return this._state;
  }

  /**
   * Client configuration
   */
  get config(): Required<IRedisClientConfig> {
    return { ...this._config }; // Return copy to prevent modification
  }

  /**
   * Whether the client is connected
   */
  get isConnected(): boolean {
    return this.client.isOpen;
  }

  /**
   * Set up event listeners for Redis client
   * @private
   */
  private setupEventListeners(): void {
    this.client.on("error", err => {
      this._state = ERedisConnectionState.DISCONNECTED;
      if (this._config.logLevel !== "none") {
        logger.error({ msg: "Redis client error", err });
      }
    });

    this.client.on("connect", () => {
      this._state = ERedisConnectionState.CONNECTED;
      this.retryCount = 0; // Reset retry count on successful connection
      if (this._config.logLevel !== "none" && this._config.logLevel !== "error") {
        logger.info("Redis client connected");
      }
    });

    this.client.on("reconnecting", () => {
      this._state = ERedisConnectionState.RECONNECTING;
      if (this._config.logLevel !== "none" && this._config.logLevel !== "error") {
        logger.info(
          `Attempting to reconnect to Redis... (Attempt ${this.retryCount + 1}/${this._config.maxRetries})`,
        );
      }
      this.retryCount++;
    });

    this.client.on("end", () => {
      this._state = ERedisConnectionState.CLOSED;
      if (this._config.logLevel !== "none" && this._config.logLevel !== "error") {
        logger.info("Redis connection closed");
      }
    });
  }

  /**
   * Connect to Redis server
   * @returns Promise that resolves when connection is established
   * @throws {AppError} If connection fails after max retries
   */
  async connect(): Promise<void> {
    // If already connecting, return the existing promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // If already connected, return immediately
    if (this.client.isOpen) {
      return Promise.resolve();
    }

    this._state = ERedisConnectionState.CONNECTING;

    // Create and store the connection promise
    this.connectionPromise = new Promise<void>((resolve, reject) => {
      const connectWithRetry = async (retryCount: number) => {
        try {
          await this.client.connect();
          this._state = ERedisConnectionState.CONNECTED;
          if (this._config.logLevel !== "none" && this._config.logLevel !== "error") {
            logger.info("Redis connection established successfully");
          }
          resolve();
        } catch (error) {
          if (retryCount < this._config.maxRetries) {
            if (this._config.logLevel !== "none" && this._config.logLevel !== "error") {
              logger.warn(`Redis connection attempt ${retryCount + 1} failed, retrying...`);
            }
            setTimeout(() => connectWithRetry(retryCount + 1), this._config.retryDelay);
          } else {
            this._state = ERedisConnectionState.DISCONNECTED;
            const appError = new AppError(
              "INTERNAL_SERVER_ERROR",
              `Failed to connect to Redis after ${this._config.maxRetries} attempts`,
              { originalError: error },
            );
            logger.error({ msg: appError.message, error });
            reject(appError);
            this.connectionPromise = null; // Reset promise to allow future connection attempts
          }
        }
      };

      connectWithRetry(0);
    });

    return this.connectionPromise;
  }

  /**
   * Disconnect from Redis server
   * @returns Promise that resolves when disconnection is complete
   */
  async disconnect(): Promise<void> {
    // If not connected, return immediately
    if (!this.client.isOpen) {
      return Promise.resolve();
    }

    this._state = ERedisConnectionState.CLOSING;

    try {
      await this.client.quit();
      this._state = ERedisConnectionState.CLOSED;
      if (this._config.logLevel !== "none" && this._config.logLevel !== "error") {
        logger.info("Redis connection closed gracefully");
      }
      this.connectionPromise = null; // Clear connection promise
    } catch (error) {
      const appError = new AppError(ErrorCode.INTERNAL_ERROR, "Error closing Redis connection", {
        originalError: error,
      });
      logger.error({ msg: appError.message, error });
      throw appError;
    }
  }

  /**
   * Ping Redis server to check connection health
   * @returns Promise resolving to "PONG" if connection is healthy
   * @throws {AppError} If ping fails or client is not connected
   */
  async ping(): Promise<string> {
    await this.ensureConnected();

    try {
      return await this.client.ping();
    } catch (error) {
      const appError = new AppError(ErrorCode.SERVICE_UNAVAILABLE, "Redis ping failed", {
        originalError: error,
      });
      logger.error({ msg: appError.message, error });
      throw appError;
    }
  }

  /**
   * Get the underlying Redis client instance
   * @returns The Redis client instance
   * @throws {AppError} If client is not connected
   */
  async getClient(): Promise<RedisClientType> {
    await this.ensureConnected();
    return this.client;
  }

  /**
   * Ensure client is connected before performing operations
   * @private
   */
  private async ensureConnected(): Promise<void> {
    if (!this.client.isOpen) {
      if (this._config.logLevel === "debug") {
        logger.debug("Redis client not connected, attempting to connect...");
      }
      await this.connect();
    }
  }

  /**
   * Handle operation errors based on options
   * @param error The error that occurred
   * @param operation The operation that failed
   * @param key The key involved in the operation (if any)
   * @param options Operation options
   * @private
   */
  private handleError(
    error: unknown,
    operation: string,
    key?: string,
    options?: ICacheOptions,
  ): null {
    const appError = new AppError(
      ErrorCode.STORAGE_ERROR,
      `Redis ${operation} operation failed${key ? ` for key "${key}"` : ""}`,
      { originalError: error },
    );

    if (this._config.logLevel !== "none") {
      logger.error({ msg: appError.message, key, error });
    }

    if (options?.throwOnError) {
      throw appError;
    }

    return null;
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @param options Cache options
   * @returns Promise resolving to cached value or null if not found
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async get<T>(key: string, options: ICacheOptions = {}): Promise<T | null> {
    try {
      await this.ensureConnected();

      const data = await this.client.get(key);
      if (!data) return null;

      try {
        return JSON.parse(data) as T;
      } catch (parseError) {
        // If JSON parsing fails, return the raw string value
        if (this._config.logLevel === "debug") {
          logger.debug({
            msg: "Non-JSON data retrieved from Redis",
            key,
            valueType: typeof data,
          });
        }
        return data as unknown as T;
      }
    } catch (error) {
      return this.handleError(error, "get", key, options);
    }
  }

  /**
   * Store a value in cache
   * @param key Cache key
   * @param value Value to store (will be JSON stringified for objects)
   * @param options Cache options
   * @returns Promise resolving to true if successful, false otherwise
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async set(key: string, value: any, options: ICacheOptions = {}): Promise<boolean> {
    try {
      await this.ensureConnected();

      const ttl = options.ttl ?? this._config.defaultTtl;
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);

      const result = await this.client.set(key, stringValue, {
        expiration: {
          type: "EX",
          value: ttl,
        },
      });

      return result === "OK";
    } catch (error) {
      this.handleError(error, "set", key, options);
      return false;
    }
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   * @param options Cache options
   * @returns Promise resolving to true if key was deleted, false if key did not exist
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async delete(key: string, options: ICacheOptions = {}): Promise<boolean> {
    try {
      await this.ensureConnected();
      const result = await this.client.del(key);
      return result >= 1;
    } catch (error) {
      this.handleError(error, "delete", key, options);
      return false;
    }
  }

  /**
   * Check if a key exists
   * @param key Cache key
   * @param options Cache options
   * @returns Promise resolving to boolean indicating if key exists
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async exists(key: string, options: ICacheOptions = {}): Promise<boolean> {
    try {
      await this.ensureConnected();
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.handleError(error, "exists", key, options);
      return false;
    }
  }

  /**
   * Set key expiration time
   * @param key Cache key
   * @param ttlSeconds Time to live in seconds
   * @param options Cache options
   * @returns Promise resolving to boolean indicating success
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async expire(key: string, ttlSeconds: number, options: ICacheOptions = {}): Promise<boolean> {
    try {
      await this.ensureConnected();
      const result = await this.client.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      this.handleError(error, "expire", key, options);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   * @param key Cache key
   * @param options Cache options
   * @returns Promise resolving to remaining TTL in seconds, -1 if no TTL, -2 if key doesn't exist
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async ttl(key: string, options: ICacheOptions = {}): Promise<number> {
    try {
      await this.ensureConnected();
      return await this.client.ttl(key);
    } catch (error) {
      this.handleError(error, "ttl", key, options);
      return -2;
    }
  }

  /**
   * Increment a number stored at key
   * @param key Cache key
   * @param increment Amount to increment by (default: 1)
   * @param options Cache options
   * @returns Promise resolving to the new value
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async increment(
    key: string,
    increment: number = 1,
    options: ICacheOptions = {},
  ): Promise<number> {
    try {
      await this.ensureConnected();
      if (increment === 1) {
        return await this.client.incr(key);
      } else {
        return await this.client.incrBy(key, increment);
      }
    } catch (error) {
      this.handleError(error, "increment", key, options);
      return 0;
    }
  }

  /**
   * Decrement a number stored at key
   * @param key Cache key
   * @param decrement Amount to decrement by (default: 1)
   * @param options Cache options
   * @returns Promise resolving to the new value
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async decrement(
    key: string,
    decrement: number = 1,
    options: ICacheOptions = {},
  ): Promise<number> {
    try {
      await this.ensureConnected();
      if (decrement === 1) {
        return await this.client.decr(key);
      } else {
        return await this.client.decrBy(key, decrement);
      }
    } catch (error) {
      this.handleError(error, "decrement", key, options);
      return 0;
    }
  }

  /**
   * Get multiple values from cache
   * @param keys Cache keys
   * @param options Cache options
   * @returns Promise resolving to array of values (null for keys that don't exist)
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async mget<T>(keys: string[], options: ICacheOptions = {}): Promise<(T | null)[]> {
    if (keys.length === 0) return [];

    try {
      await this.ensureConnected();
      const values = await this.client.mGet(keys);

      return values.map(item => {
        if (item === null) return null;

        try {
          return JSON.parse(item) as T;
        } catch {
          return item as unknown as T;
        }
      });
    } catch (error) {
      this.handleError(error, "mget", keys.join(","), options);
      return new Array(keys.length).fill(null);
    }
  }

  /**
   * Store multiple key-value pairs
   * @param items Object with key-value pairs to store
   * @param options Cache options
   * @returns Promise resolving to boolean indicating if the operation was successful
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async mset(items: Record<string, any>, options: ICacheOptions = {}): Promise<boolean> {
    const entries = Object.entries(items);
    if (entries.length === 0) return true;

    try {
      await this.ensureConnected();

      // Prepare key-value pairs for mset, stringify objects
      const args: string[] = [];
      for (const [key, value] of entries) {
        args.push(key);
        args.push(typeof value === "object" ? JSON.stringify(value) : String(value));
      }

      // Execute mset
      const result = await this.client.mSet(args);

      // Set expiration for each key if TTL is provided
      if (options.ttl !== undefined) {
        const ttl = options.ttl;
        const pipeline = this.client.multi();

        for (const [key] of entries) {
          pipeline.expire(key, ttl);
        }

        await pipeline.exec();
      }

      return result === "OK";
    } catch (error) {
      this.handleError(error, "mset", Object.keys(items).join(","), options);
      return false;
    }
  }

  /**
   * Add member to a set
   * @param key The key of the set
   * @param member The member to add
   * @param options Cache options
   * @returns Promise resolving to boolean indicating if member was added
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async sadd(key: string, member: string, options: ICacheOptions = {}): Promise<boolean> {
    try {
      await this.ensureConnected();
      const result = await this.client.sAdd(key, member);

      // If this is a new set, set TTL if provided
      if (result === 1 && options.ttl !== undefined) {
        await this.client.expire(key, options.ttl);
      }

      return result === 1;
    } catch (error) {
      this.handleError(error, "sadd", key, options);
      return false;
    }
  }

  /**
   * Check if member is in set
   * @param key The key of the set
   * @param member The member to check
   * @param options Cache options
   * @returns Promise resolving to boolean indicating if member exists in set
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async sismember(key: string, member: string, options: ICacheOptions = {}): Promise<boolean> {
    try {
      await this.ensureConnected();
      const result = await this.client.sIsMember(key, member);
      return result;
    } catch (error) {
      this.handleError(error, "sismember", key, options);
      return false;
    }
  }

  /**
   * Get all members of a set
   * @param key The key of the set
   * @param options Cache options
   * @returns Promise resolving to array of members
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async smembers(key: string, options: ICacheOptions = {}): Promise<string[]> {
    try {
      await this.ensureConnected();
      return await this.client.sMembers(key);
    } catch (error) {
      this.handleError(error, "smembers", key, options);
      return [];
    }
  }

  /**
   * Remove member from a set
   * @param key The key of the set
   * @param member The member to remove
   * @param options Cache options
   * @returns Promise resolving to boolean indicating if member was removed
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async srem(key: string, member: string, options: ICacheOptions = {}): Promise<boolean> {
    try {
      await this.ensureConnected();
      const result = await this.client.sRem(key, member);
      return result === 1;
    } catch (error) {
      this.handleError(error, "srem", key, options);
      return false;
    }
  }

  /**
   * Execute a Lua script
   * @param script The Lua script to execute
   * @param keys Array of keys accessed by the script
   * @param args Array of arguments to the script
   * @param options Cache options
   * @returns Promise resolving to script result
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async eval<T>(
    script: string,
    keys: string[],
    args: string[],
    options: ICacheOptions = {},
  ): Promise<T | null> {
    try {
      await this.ensureConnected();
      const result = await this.client.eval(script, {
        keys,
        arguments: args,
      });

      return result as T;
    } catch (error) {
      this.handleError(error, "eval", keys.join(","), options);
      return null;
    }
  }

  /**
   * Flush all data from the Redis database
   * @param options Cache options
   * @returns Promise resolving to boolean indicating success
   * @throws {AppError} If operation fails and throwOnError is true
   */
  async flushAll(options: ICacheOptions = {}): Promise<boolean> {
    try {
      await this.ensureConnected();
      await this.client.flushAll();
      return true;
    } catch (error) {
      this.handleError(error, "flushAll", undefined, options);
      return false;
    }
  }
}

// Create a singleton instance with default config
const redisClient = new RedisClient();

export default redisClient;
