/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Thread state information
 */
export interface IThreadState {
  workloads: number[];
  operations: number;
  lastUpdated: string;
  activeThreads: number;
  metadata?: Record<string, any>;
}

/**
 * Configuration options for ThreadsManager
 */
export interface IThreadsManagerOptions {
  /** Maximum operations per thread before recycling */
  operationsPerThread: number;
  /** Path to store encrypted state */
  statePath?: string;
  /** Default worker file name (without extension) */
  defaultWorker?: string;
  /** Auto-save state interval in milliseconds (0 to disable) */
  autoSaveInterval?: number;
  /** Whether to recycle threads after max operations */
  recycleThreads?: boolean;
  /** Maximum number of threads to spawn */
  maxThreads?: number;
  /** Password for state encryption */
  encryptionPassword?: string;
}

/**
 * Thread operation result
 */
export interface IThreadResult<T = any> {
  error?: string;
  data?: T;
  threadId?: number;
  operationId?: string;
  timestamp?: string;
}
