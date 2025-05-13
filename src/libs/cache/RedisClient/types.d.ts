import { RedisClientOptions } from "redis";

/**
 * Redis Connection States
 */
export enum ERedisConnectionState {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  RECONNECTING = "reconnecting",
  CLOSING = "closing",
  CLOSED = "closed",
}

/**
 * Redis Client Configuration Options
 */
export interface IRedisClientConfig extends Partial<RedisClientOptions> {
  /** Default TTL in seconds for cached items */
  defaultTtl?: number;
  /** Maximum number of connection retries */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** Log level for Redis operations */
  logLevel?: "debug" | "info" | "warn" | "error" | "none";
}

/**
 * Cache operation options
 */
export interface ICacheOptions {
  /** Time to live in seconds */
  ttl?: number;
  /** Whether to throw error if operation fails */
  throwOnError?: boolean;
}
