import { ILookupService } from "./ILookupService";

/**
 * Abstract base class for multilayer lookup services
 * Implements the lookup logic across multiple layers (BloomFilter Layer -> Cache Layer -> Databse Layer)
 */
abstract class AbstractMultiLayerLookupService<T, K> implements ILookupService<T, K> {
  /**
   * Checks if a key exists using all available layers
   */
  async exists(key: K): Promise<boolean> {
    // First check bloom filter (fastest but probabilistic)
    if ((await this.existsInBloomFilter(key)) === false) {
      return false; // Definitely not in any layer if bloom filter says no
    }

    // Then check cache (fast but might not be there)
    const cachedEntity = await this.getFromCache(key);
    if (cachedEntity !== null) {
      return true;
    }

    // Finally check the persistent store
    return await this.existsInStore(key);
  }

  /**
   * Retrieves an entity by checking through all layers
   */
  async get(key: K): Promise<T | null> {
    // First check bloom filter (fastest)
    if ((await this.existsInBloomFilter(key)) === false) {
      return null; // Definitely not in any layer
    }

    // Check cache
    const cachedEntity = await this.getFromCache(key);
    if (cachedEntity !== null) {
      return cachedEntity;
    }

    // Finally check the store
    const entity = await this.getFromStore(key);

    // Update cache if found
    if (entity !== null) {
      await this.addToCache(key, entity);
    }

    return entity;
  }

  /**
   * Adds an entity to all layers
   * TODO POSSIBLE ISSUE: What if one of the services was failing? for example the Redis Cache?
   * TODO POSSIBLE SOLN: Use Promise methods to figure out if something had failed or not. If yes, have a retry mechanism
   */
  async add(key: K, entity: T): Promise<void> {
    // If the Key already exists in the store, we should not add it again
    // This is a potential issue if the store is not in sync with the cache
    if (await this.exists(key)) {
      throw new Error(`Entity with key ${key} already exists`);
    }

    // Add to persistent store first
    await this.addToStore(key, entity);

    // Then update cache
    await this.addToCache(key, entity);

    // Finally update bloom filter
    await this.addToBloomFilter(key);
  }

  // Abstract methods to be implemented by specific lookup services
  protected abstract existsInBloomFilter(key: K): Promise<boolean>;
  protected abstract existsInStore(key: K): Promise<boolean>;
  protected abstract getFromCache(key: K): Promise<T | null>;
  protected abstract getFromStore(key: K): Promise<T | null>;
  protected abstract addToBloomFilter(key: K): Promise<void>;
  protected abstract addToCache(key: K, entity: T): Promise<void>;
  protected abstract addToStore(key: K, entity: T): Promise<void>;
  protected abstract removeFromCache(key: K): Promise<void>;
}

export default AbstractMultiLayerLookupService;
