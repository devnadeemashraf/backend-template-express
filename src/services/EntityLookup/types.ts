/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Lookup result with source information
 */
export interface ILookupResult<T = any> {
  exists: boolean;
  entity?: T;
  source: "bloomfilter" | "redis" | "database" | "none";
  queryTimeMs: number;
}

/**
 * Lookup options to customize behavior
 */
export interface ILookupOptions {
  skipBloomFilter?: boolean;
  skipRedisCache?: boolean;
  forceDatabaseCheck?: boolean;
  updateCachesIfFound?: boolean;
  timeout?: number;
}

/**
 * Strategy for fetching entity data from the database
 */
export interface IEntityFetchStrategy<T> {
  /**
   * Get an entity by its unique identifier
   * @param identifier - The unique identifier to look up
   * @returns The entity data or null if not found
   */
  getByIdentifier(identifier: string): Promise<T | null>;

  /**
   * Get the Redis cache key for this entity type and identifier
   * @param identifier - The identifier to generate a key for
   * @returns The Redis cache key
   */
  getRedisCacheKey(identifier: string): string;

  /**
   * Get the BloomFilter identifier for this entity
   * @param identifier - The primary identifier
   * @returns The identifier to use for BloomFilter
   */
  getBloomFilterKey(identifier: string): string;
}
