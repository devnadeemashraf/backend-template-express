/**
 * Generic interface for lookup operations
 * @template T The type of entity being looked up
 * @template K The type of key used for lookups
 */
export interface ILookupService<T, K> {
  /**
   * Checks if a key exists
   * @param key The key to check
   * @returns Promise resolving to boolean indicating existence
   */
  exists(key: K): Promise<boolean>;

  /**
   * Retrieves an entity by its key
   * @param key The key to lookup
   * @returns Promise resolving to the entity or null if not found
   */
  get(key: K): Promise<T | null>;

  /**
   * Adds a new key to the lookup service
   * @param key The key to add
   * @param entity The entity associated with the key
   */
  add(key: K, entity: T): Promise<void>;
}
