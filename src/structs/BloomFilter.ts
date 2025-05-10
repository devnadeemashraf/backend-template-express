/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import xxhash from "xxhash-wasm"; // You'll need to install: npm install xxhash-wasm

/**
 * Interface representing the serializable state of a BloomFilter
 */
export interface IBloomFilterState {
  size: number;
  numberOfHashFunctions: number;
  bitArray: number[];
  expectedElements?: number; // Optional for self-optimization
}

/**
 * Bloom Filter implementation for probabilistic set membership testing
 *
 * A Bloom filter is a space-efficient probabilistic data structure that is used
 * to test whether an element is a member of a set. False positives are possible,
 * but false negatives are not.
 */
export class BloomFilter {
  private size: number;
  private numberOfHashFunctions: number;
  private bitArray: number[];
  private hashCache: Map<string, number[]>;
  private readonly MAX_CACHE_SIZE = 1000; // Adjust based on expected usage patterns
  private xxHasher: any | null = null;
  private expectedElements: number;

  /**
   * Creates a new Bloom Filter
   * @param expectedElements - The expected number of elements to be stored (used to optimize hash functions)
   * @param size - The size of the bit array (defaults to expectedElements * 10 for ~1% false positive rate)
   * @param numberOfHashFunctions - Optional override for the number of hash functions
   *        If not provided, automatically calculated as (size/expectedElements) * ln(2)
   */
  constructor(expectedElements: number = 1000, size?: number, numberOfHashFunctions?: number) {
    this.expectedElements = expectedElements;
    this.size = size || Math.ceil(expectedElements * 10); // ~1% false positive rate

    // Calculate optimal number of hash functions if not provided
    this.numberOfHashFunctions =
      numberOfHashFunctions || BloomFilter.getOptimalHashFunctions(this.size, expectedElements);

    this.bitArray = new Array(this.size).fill(0);
    this.hashCache = new Map<string, number[]>();

    // Initialize the xxhash function (asynchronously)
    this.initXXHash();
  }

  /**
   * Initialize the xxhash function
   * @private
   */
  private async initXXHash(): Promise<void> {
    try {
      this.xxHasher = await xxhash();
    } catch (error) {
      console.warn("Failed to initialize xxhash, falling back to crypto:", error);
    }
  }

  /**
   * Serializes an element to a consistent string representation
   * @param element - The element to serialize
   * @returns A string representation of the element
   * @throws Error if the element cannot be serialized
   */
  private serializeElement(element: unknown): string {
    if (element === null || element === undefined) {
      return String(element);
    }

    if (typeof element === "string") {
      return element;
    }

    if (typeof element === "number" || typeof element === "boolean") {
      return String(element);
    }

    if (typeof element === "object") {
      try {
        return JSON.stringify(element);
      } catch (error) {
        throw new Error(`Unable to serialize element: ${(error as Error).message}`);
      }
    }

    throw new Error(`Unsupported element type: ${typeof element}`);
  }

  /**
   * Generate hash indices for an element with caching
   * @param element - The element to hash
   * @returns An array of hash indices
   */
  private getHashes(element: unknown): number[] {
    const serialized = this.serializeElement(element);

    // Check cache first
    if (this.hashCache.has(serialized)) {
      return this.hashCache.get(serialized)!;
    }

    // Generate new hashes
    const hashes = this.generateHashesEfficiently(serialized);

    // Cache management - remove oldest entry if we hit the limit
    if (this.hashCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.hashCache.keys().next().value;
      this.hashCache.delete(firstKey as string);
    }

    // Store in cache
    this.hashCache.set(serialized, hashes);

    return hashes;
  }

  /**
   * Efficiently generate multiple hash values from a single input
   * Uses xxhash when available (faster) or falls back to crypto (more secure)
   * @param input - The serialized input string
   * @returns An array of hash indices
   */
  private generateHashesEfficiently(input: string): number[] {
    if (this.xxHasher) {
      return this.generateXXHashes(input);
    } else {
      return this.generateCryptoHashes(input);
    }
  }

  /**
   * Generate hashes using xxhash (faster non-cryptographic algorithm)
   * @param input - The serialized input string
   * @returns An array of hash indices
   */
  private generateXXHashes(input: string): number[] {
    const hashes: number[] = [];
    const baseHash = Buffer.from(input, "utf8");

    for (let i = 0; i < this.numberOfHashFunctions; i++) {
      // Use different seeds for each hash function
      const seed = 0xabcd + i * 0x1234;
      const hashValue = this.xxHasher.h64(baseHash, seed) % this.size;
      hashes.push(hashValue);
    }

    return hashes;
  }

  /**
   * Generate hashes using Node's crypto module (secure fallback)
   * @param input - The serialized input string
   * @returns An array of hash indices
   */
  private generateCryptoHashes(input: string): number[] {
    const hashes: number[] = [];

    // Generate one strong hash to derive multiple values from
    const baseHash = crypto.createHash("sha256").update(input).digest();

    // Extract multiple hash values from the single hash
    for (let i = 0; i < this.numberOfHashFunctions; i++) {
      // Use 4 bytes (32 bits) for each derived hash
      const hashValue =
        ((baseHash[(i * 4) % 32] << 24) |
          (baseHash[(i * 4 + 1) % 32] << 16) |
          (baseHash[(i * 4 + 2) % 32] << 8) |
          baseHash[(i * 4 + 3) % 32]) %
        this.size;

      hashes.push(hashValue);
    }

    return hashes;
  }

  /**
   * Adds an element to the Bloom Filter
   * @param element - Element to add
   * @returns True if the element was added, false if it might already exist
   */
  add(element: unknown): boolean {
    // Check if element is possibly in the filter already
    if (!this.has(element)) {
      const hashes = this.getHashes(element);
      for (const hash of hashes) {
        this.bitArray[hash] = 1;
      }
      return true;
    }

    // Element possibly already exists
    return false;
  }

  /**
   * Adds multiple elements to the Bloom Filter
   * @param elements - Array of elements to add
   * @returns Number of elements that were definitely added
   */
  addAll(elements: unknown[]): number {
    let addedCount = 0;
    for (const element of elements) {
      if (this.add(element)) {
        addedCount++;
      }
    }
    return addedCount;
  }

  /**
   * Checks if an element might exist in the Bloom Filter
   * @param element - Element to check
   * @returns True if the element might exist, false if it definitely doesn't
   */
  has(element: unknown): boolean {
    const hashes = this.getHashes(element);
    for (const hash of hashes) {
      if (this.bitArray[hash] === 0) {
        return false; // Element definitely not in the filter
      }
    }
    return true; // Element is possibly in the filter
  }

  /**
   * Clears the hash cache to free memory
   */
  clearCache(): void {
    this.hashCache.clear();
  }

  /**
   * Resets the Bloom Filter, clearing all entries and cache
   */
  reset(): void {
    this.bitArray.fill(0);
    this.clearCache();
  }

  /**
   * Returns the current state of the Bloom Filter
   * @returns The current state as an IBloomFilterState object
   */
  export(): IBloomFilterState {
    return {
      size: this.size,
      numberOfHashFunctions: this.numberOfHashFunctions,
      bitArray: [...this.bitArray], // Create a copy to prevent external modification
      expectedElements: this.expectedElements,
    };
  }

  /**
   * Imports a state into the Bloom Filter
   * @param state - The state to import
   * @throws Error if the state is invalid
   */
  import(state: IBloomFilterState): void {
    if (
      !state ||
      !Array.isArray(state.bitArray) ||
      typeof state.size !== "number" ||
      typeof state.numberOfHashFunctions !== "number"
    ) {
      throw new Error("Invalid bloom filter state");
    }

    this.size = state.size;
    this.numberOfHashFunctions = state.numberOfHashFunctions;
    this.bitArray = [...state.bitArray]; // Create a copy to prevent external modification

    // If expectedElements was saved, restore it
    if (state.expectedElements) {
      this.expectedElements = state.expectedElements;
    }

    this.clearCache(); // Clear cache when importing new state
  }

  /**
   * Returns the approximate false positive rate for the current state
   * @returns The estimated false positive probability
   */
  getFalsePositiveRate(): number {
    // Count the number of set bits
    const setBits = this.bitArray.filter(bit => bit === 1).length;
    // Calculate the approximate false positive rate using the formula:
    // (1 - e^(-k*n/m))^k
    // where k is the number of hash functions, n is the number of elements, and m is the size
    const filledRatio = setBits / this.size;
    return Math.pow(
      1 - Math.exp(-this.numberOfHashFunctions * filledRatio),
      this.numberOfHashFunctions,
    );
  }

  /**
   * Calculates the optimal number of hash functions for a given size and expected number of elements
   * @param size - The size of the bit array
   * @param expectedElements - The expected number of elements to be inserted
   * @returns The optimal number of hash functions
   */
  static getOptimalHashFunctions(size: number, expectedElements: number): number {
    return Math.max(1, Math.round((size / expectedElements) * Math.log(2)));
  }

  /**
   * Calculates the optimal size for a Bloom filter given the expected number of elements
   * and desired false positive rate
   * @param expectedElements - The expected number of elements to be inserted
   * @param falsePositiveRate - The desired false positive rate (default: 0.01 = 1%)
   * @returns The optimal size for the bit array
   */
  static getOptimalSize(expectedElements: number, falsePositiveRate: number = 0.01): number {
    return Math.ceil(
      -(expectedElements * Math.log(falsePositiveRate)) / (Math.log(2) * Math.log(2)),
    );
  }

  /**
   * Saves the Bloom Filter state to an encrypted string
   * @param encryption - The encryption utility to use
   * @param password - The password to encrypt with
   * @returns Promise that resolves to the encrypted state string
   */
  async saveEncrypted(encryption: any, password: string): Promise<string> {
    try {
      const state = this.export();
      const stateJson = JSON.stringify(state);
      return await encryption.encrypt(stateJson, password);
    } catch (error) {
      throw new Error(`Failed to save encrypted state: ${(error as Error).message}`);
    }
  }

  /**
   * Loads the Bloom Filter state from an encrypted string
   * @param encryptedState - The encrypted state string
   * @param encryption - The encryption utility to use
   * @param password - The password to decrypt with
   * @returns Promise that resolves when the state is loaded
   */
  async loadEncrypted(encryptedState: string, encryption: any, password: string): Promise<void> {
    try {
      const decrypted = (await encryption.decrypt(encryptedState, password, "utf8")) as string;
      const state = JSON.parse(decrypted) as IBloomFilterState;
      this.import(state);
    } catch (error) {
      throw new Error(`Failed to load encrypted state: ${(error as Error).message}`);
    }
  }
}

export default BloomFilter;
