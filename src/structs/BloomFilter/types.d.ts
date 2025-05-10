/**
 * Interface representing the serializable state of a BloomFilter
 */
export interface IBloomFilterState {
  size: number;
  numberOfHashFunctions: number;
  bitArray: number[];
  expectedElements?: number; // Optional for self-optimization
}
