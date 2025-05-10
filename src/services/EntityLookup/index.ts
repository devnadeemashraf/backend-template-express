/* eslint-disable @typescript-eslint/no-explicit-any */
import ThreadsManager from "@/structs/ThreadsManager";

import { IEntityLookupServiceRepository } from "@/repositories";
import { AppError } from "@/libs/AppError";

import { IEntityFetchStrategy, ILookupOptions, ILookupResult } from "./types";
import { BLOOM_FILTER_PATH, ENCRYPTION_KEY } from "@/core/config";

/**
 * Service for efficient entity lookups using multi-tier caching:
 * BloomFilter -> Redis -> Database
 */
class EntityLookupService {
  private threadsManager: ThreadsManager;
  private bloomFilterInitialized: boolean = false;

  constructor(
    private entityLookupServiceRepository: IEntityLookupServiceRepository,
    threadManagerOptions?: any,
  ) {
    // Initialize ThreadsManager with custom settings
    this.threadsManager = new ThreadsManager({
      defaultWorker: "bloomFilterWorker",
      operationsPerThread: 5000, // Higher threshold for BloomFilter operations
      maxThreads: 2, // BloomFilter operations are lightweight
      ...threadManagerOptions,
    });

    // Initialize on startup
    this.initialize().catch(logger.error);

    // Handle application shutdown
    process.on("SIGINT", () => this.shutdown());
    process.on("SIGTERM", () => this.shutdown());
  }

  /**
   * Initialize the BloomFilter thread
   */
  async initialize() {
    try {
      // Load Previous State if Exists
      await this.threadsManager.loadState();

      // Initialize BloomFilter in WokrerThread
      await this.threadsManager.assignOperation("initialize", {
        expectedElements: 100_000, // Adjust based on your expected user base
        falsePositiveRate: 0.01,
        loadExisting: true,
        password: ENCRYPTION_KEY,
        statePath: BLOOM_FILTER_PATH,
      });

      this.bloomFilterInitialized = true;
      logger.info("EntityLookupService: BloomFilter initialized successfully");
    } catch (error) {
      logger.error("EntityLookupService: Failed to initialize BloomFilter:", error);
      this.bloomFilterInitialized = false;
    }
  }

  /**
   * Gracefully shut down the service
   */
  async shutdown(): Promise<void> {
    try {
      if (this.bloomFilterInitialized) {
        // Save BloomFilter State before Shutdown
        await this.threadsManager.assignOperation("save", null);
      }

      // Terminate all threads
      await this.threadsManager.terminateAll();
      logger.info("EntityLookupService: Shutdown completed successfully");
    } catch (error) {
      logger.error("EntityLookupService: Failed to shut down gracefully:", error);
    }
  }

  /**
   * Check if an entity exists using the multi-tier lookup strategy
   * @param identifier - The entity identifier to check
   * @param fetchStrategy - Strategy for fetching from database
   * @param options - Lookup options
   * @returns Lookup result with source information
   */
  async exists<T>(
    identifier: string,
    fetchStrategy: IEntityFetchStrategy<T>,
    options: ILookupOptions = {},
  ): Promise<ILookupResult<T>> {
    const startTime = Date.now();
    const {
      skipBloomFilter = false,
      skipRedisCache = false,
      forceDatabaseCheck = false,
      updateCachesIfFound = true,
      timeout = 5000,
    } = options;

    try {
      // BloomFilter check (fastest, but may have false positives)
      if (!skipBloomFilter && this.bloomFilterInitialized) {
        try {
          const bloomFilterKey = fetchStrategy.getBloomFilterKey(identifier);
          const result = await this.threadsManager.assignOperation("checkExists", bloomFilterKey, {
            timeout,
          });

          if (!result.exists) {
            // If not in BloomFilter, it definitely doesn't exist (no false negatives)
            return {
              exists: false,
              source: "bloomfilter",
              queryTimeMs: Date.now() - startTime,
            };
          }

          // If BloomFilter says it might exist, continue to next tier
          // (could be false positive)
        } catch (error) {
          // On BloomFilter error, continue to next tier
          logger.warn("BloomFilter check failed, falling back to Redis:", error);
        }
      }

      // Redis cache check
      if (!skipRedisCache) {
        try {
          const cacheKey = fetchStrategy.getRedisCacheKey(identifier);
          const cachedData = await this.entityLookupServiceRepository.get(cacheKey);

          if (cachedData) {
            // Entity exists in Redis cache
            return {
              exists: true,
              entity: JSON.parse(cachedData),
              source: "redis",
              queryTimeMs: Date.now() - startTime,
            };
          } else if (!forceDatabaseCheck) {
            // Not in Redis cache, but we're not forcing DB check
            // (This assumes Redis is a complete cache of entities)
            return {
              exists: false,
              source: "redis",
              queryTimeMs: Date.now() - startTime,
            };
          }

          // Not in Redis or forcing DB check, continue to database
        } catch (error) {
          // On Redis error, fall back to database
          logger.warn("Redis check failed, falling back to database:", error);
        }
      }

      // Database check (slowest but definitive)
      const entity = await fetchStrategy.getByIdentifier(identifier);

      if (entity) {
        // Entity exists in database

        // Update caches if requested
        if (updateCachesIfFound) {
          this.updateCaches(identifier, entity, fetchStrategy).catch(logger.error);
        }

        return {
          exists: true,
          entity,
          source: "database",
          queryTimeMs: Date.now() - startTime,
        };
      }

      // Entity doesn't exist anywhere
      return {
        exists: false,
        source: "database",
        queryTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      throw new AppError(
        "INTERNAL_SERVER_ERROR",
        `Entity lookup failed: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Update caches with entity data (Redis and BloomFilter)
   * @param identifier - Entity identifier
   * @param entity - Entity data
   * @param fetchStrategy - Strategy for cache key generation
   */
  private async updateCaches<T>(
    identifier: string,
    entity: T,
    fetchStrategy: IEntityFetchStrategy<T>,
  ): Promise<void> {
    try {
      // Update Redis cache
      const cacheKey = fetchStrategy.getRedisCacheKey(identifier);
      await this.entityLookupServiceRepository.set(cacheKey, JSON.stringify(entity), "EX", 3600); // 1 hour TTL

      // Update BloomFilter (if initialized)
      if (this.bloomFilterInitialized) {
        const bloomFilterKey = fetchStrategy.getBloomFilterKey(identifier);
        await this.threadsManager.assignOperation("add", bloomFilterKey);
      }
    } catch (error) {
      logger.error("Failed to update caches:", error);
    }
  }

  /**
   * Add entity identifiers to the BloomFilter
   * @param identifiers - Array of entity identifiers
   * @param keyTransformer - Function to transform identifiers for BloomFilter
   * @returns Number of items added
   */
  async addToBloomFilter(
    identifiers: string[],
    keyTransformer: (id: string) => string = id => id,
  ): Promise<number> {
    if (!this.bloomFilterInitialized) {
      throw new AppError("SERVICE_UNAVAILABLE", "BloomFilter is not initialized");
    }

    const keys = identifiers.map(keyTransformer);
    const result = await this.threadsManager.assignOperation("addAll", keys);
    return result.addedCount;
  }

  /**
   * Get the current BloomFilter stats
   * @returns Filter statistics
   */
  async getBloomFilterStats(): Promise<any> {
    if (!this.bloomFilterInitialized) {
      throw new AppError("SERVICE_UNAVAILABLE", "BloomFilter is not initialized");
    }

    return await this.threadsManager.assignOperation("getStats", null);
  }
}

export default EntityLookupService;
