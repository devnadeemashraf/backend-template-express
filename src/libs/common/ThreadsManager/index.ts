/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import { Worker } from "worker_threads";

import { AppError } from "@/libs/AppError";

import fileSystem from "@/libs/common/FileSystem";
import encryption from "@/libs/common/Encryption";

import { IThreadResult, IThreadsManagerOptions, IThreadState } from "./types";

/**
 * Manages worker threads for parallel processing operations
 * with state persistence and automatic thread recycling
 */
class ThreadsManager {
  private options: Required<IThreadsManagerOptions>;
  private threads: Worker[];
  private threadWorkLoads: number[];
  private autoSaveTimer?: NodeJS.Timeout;
  private operationCounter: number = 0;
  private metadata: Record<string, any> = {};
  private isShuttingDown: boolean = false;

  /**
   * Creates a new ThreadsManager instance
   * @param options - Configuration options
   */
  constructor(options?: Partial<IThreadsManagerOptions>) {
    this.options = {
      operationsPerThread: options?.operationsPerThread || 1000,
      statePath: options?.statePath || path.join(process.cwd(), "data", "threads-state.enc"),
      defaultWorker: options?.defaultWorker || "worker",
      autoSaveInterval: options?.autoSaveInterval ?? 60000, // 1 minute default, 0 to disable
      recycleThreads: options?.recycleThreads ?? true,
      maxThreads: options?.maxThreads || 16, // Reasonable default for most systems
      encryptionPassword:
        options?.encryptionPassword || process.env.ENCRYPTION_KEY || "default-thread-manager-key",
    };

    this.threads = [];
    this.threadWorkLoads = [];

    // Setup auto-save if enabled
    if (this.options.autoSaveInterval > 0) {
      this.startAutoSave();
    }

    // Setup graceful shutdown handlers
    this.setupShutdownHandlers();
  }

  /**
   * Get the number of active threads
   */
  get activeThreads(): number {
    return this.threads.length;
  }

  /**
   * Get total operation count across all threads
   */
  get totalOperations(): number {
    return this.operationCounter;
  }

  /**
   * Get work distribution across threads
   */
  get workloadDistribution(): number[] {
    return [...this.threadWorkLoads];
  }

  /**
   * Sets metadata that will be saved with the thread state
   * @param key - Metadata key
   * @param value - Metadata value
   */
  setMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  /**
   * Gets metadata value
   * @param key - Metadata key
   * @returns The metadata value or undefined if not found
   */
  getMetadata<T = any>(key: string): T | undefined {
    return this.metadata[key] as T;
  }

  /**
   * Creates a new thread for processing operations
   * @param workerName - The name of the worker file (without extension)
   * @returns The index of the created thread
   * @throws If the worker file doesn't exist or max threads reached
   */
  async createThread(workerName?: string): Promise<number> {
    // Check for max threads limit
    if (this.threads.length >= this.options.maxThreads) {
      throw new AppError(
        "INTERNAL_SERVER_ERROR",
        `Maximum number of threads (${this.options.maxThreads}) reached`,
      );
    }

    const workerFileName =
      (workerName || this.options.defaultWorker) + fileSystem.getApptFileExtension();
    const workerPath = fileSystem.joinPaths("root", `src/workers/${workerFileName}`);

    // Check if worker file exists
    if (!(await fileSystem.exists(workerPath))) {
      throw new AppError("NOT_FOUND", `Worker file not found: ${workerPath}`);
    }

    try {
      // Create the worker with error handling
      const worker = new Worker(workerPath);

      // Listen for worker errors
      worker.on("error", err => {
        console.error(`Thread error in worker ${this.threads.indexOf(worker)}:`, err);
        // Auto-remove errored thread
        this.removeThread(this.threads.indexOf(worker));
      });

      // Capture exit events
      worker.on("exit", code => {
        if (code !== 0) {
          console.warn(`Worker exited with code ${code}`);
        }
        // Make sure we clean up any references
        this.removeThread(this.threads.indexOf(worker));
      });

      this.threads.push(worker);
      this.threadWorkLoads.push(0);

      return this.threads.length - 1;
    } catch (error) {
      throw new AppError(
        "INTERNAL_SERVER_ERROR",
        `Failed to create worker thread: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Assigns an operation to an available thread
   * @param action - The action to perform
   * @param payload - The payload for the action
   * @param options - Additional options for the operation
   * @returns Promise resolving to the operation result
   */
  async assignOperation<T = any>(
    action: string,
    payload: any,
    options: {
      timeout?: number;
      priority?: "high" | "normal" | "low";
    } = {},
  ): Promise<T> {
    if (this.isShuttingDown) {
      throw new AppError(
        "INTERNAL_SERVER_ERROR",
        "Thread manager is shutting down, no new operations accepted",
      );
    }

    // Find or create a suitable thread
    const threadIdx = await this.findAvailableThread();
    const operationId = `op-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Increment workload counter
    this.threadWorkLoads[threadIdx]++;
    this.operationCounter++;

    // Create timeout promise if needed
    const timeoutPromise = options.timeout
      ? new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new AppError("REQUEST_TIMEOUT", `Operation timed out after ${options.timeout}ms`),
            );
          }, options.timeout);
        })
      : null;

    // Execute the operation
    const operationPromise = new Promise<T>((resolve, reject) => {
      const worker = this.threads[threadIdx];

      // Setup message handler for this specific operation
      const messageHandler = (response: IThreadResult<T>) => {
        // Check if this is the response for our operation
        if (response.operationId === operationId) {
          // Clean up the listener
          worker.removeListener("message", messageHandler);

          if (response.error) {
            reject(new AppError("INTERNAL_SERVER_ERROR", `Worker error: ${response.error}`));
          } else {
            resolve(response.data as T);
          }

          // Check if thread needs recycling after operation
          if (
            this.options.recycleThreads &&
            this.threadWorkLoads[threadIdx] >= this.options.operationsPerThread
          ) {
            this.recycleThread(threadIdx).catch(console.error);
          }
        }
      };

      // Register the message handler
      worker.on("message", messageHandler);

      // Send the message to the worker
      worker.postMessage({
        action,
        payload,
        operationId,
        timestamp: new Date().toISOString(),
      });
    });

    // Race the operation against timeout if provided
    return timeoutPromise
      ? (Promise.race([operationPromise, timeoutPromise]) as Promise<T>)
      : operationPromise;
  }

  /**
   * Finds an available thread or creates a new one
   * @returns The index of an available thread
   * @private
   */
  private async findAvailableThread(): Promise<number> {
    // Look for thread with capacity
    for (let i = 0; i < this.threads.length; i++) {
      if (this.threadWorkLoads[i] < this.options.operationsPerThread) {
        return i;
      }
    }

    // All threads at capacity, create a new one if possible
    return await this.createThread();
  }

  /**
   * Recycles a thread by terminating it and creating a new one
   * @param index - Index of the thread to recycle
   * @private
   */
  private async recycleThread(index: number): Promise<void> {
    try {
      // Get any state from worker before terminating
      const state = await this.getThreadState(index);

      // Terminate the old worker
      await this.terminateThread(index);

      // Create a new worker
      const newIndex = await this.createThread();

      // Restore state if needed
      if (state) {
        const worker = this.threads[newIndex];
        worker.postMessage({ action: "restoreState", payload: state });
      }
    } catch (error) {
      console.error(`Failed to recycle thread ${index}:`, error);
    }
  }

  /**
   * Retrieves state from a worker thread
   * @param index - Index of the thread
   * @returns Promise resolving to the thread state or null
   * @private
   */
  private async getThreadState(index: number): Promise<any | null> {
    try {
      const worker = this.threads[index];
      return new Promise(resolve => {
        const timeout = setTimeout(() => resolve(null), 1000); // 1 second timeout

        const handler = (msg: IThreadResult) => {
          if (msg.data && msg.threadId === index) {
            clearTimeout(timeout);
            worker.removeListener("message", handler);
            resolve(msg.data);
          }
        };

        worker.on("message", handler);
        worker.postMessage({ action: "getState", payload: null });
      });
    } catch {
      return null;
    }
  }

  /**
   * Terminates a specific thread
   * @param index - The index of the thread to terminate
   */
  async terminateThread(index: number): Promise<void> {
    if (index < 0 || index >= this.threads.length) {
      throw new AppError("INTERNAL_SERVER_ERROR", `Invalid thread index: ${index}`);
    }

    const worker = this.threads[index];

    try {
      // Send termination message to allow clean shutdown
      worker.postMessage({ action: "shutdown", payload: null });

      // Give the worker a short time to clean up
      await new Promise(resolve => setTimeout(resolve, 100));

      // Force terminate if still running
      await worker.terminate();
    } catch (error) {
      console.warn(`Error terminating thread ${index}:`, error);
    } finally {
      // Remove from our arrays regardless
      this.removeThread(index);
    }
  }

  /**
   * Removes a thread from the internal arrays
   * @param index - Thread index to remove
   * @private
   */
  private removeThread(index: number): void {
    if (index < 0 || index >= this.threads.length) return;

    this.threads.splice(index, 1);
    this.threadWorkLoads.splice(index, 1);
  }

  /**
   * Terminates all threads
   */
  async terminateAll(): Promise<void> {
    this.isShuttingDown = true;

    // Stop auto-save
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }

    // Save state before terminating
    await this.saveState();

    // Create a copy of threads to avoid issues with array modification during iteration
    const threadsCopy = [...this.threads];

    // Terminate all threads
    const terminationPromises = threadsCopy.map(async (_, index) => {
      try {
        await this.terminateThread(index);
      } catch (error) {
        console.warn(`Error terminating thread ${index}:`, error);
      }
    });

    await Promise.all(terminationPromises);

    this.threads = [];
    this.threadWorkLoads = [];
  }

  /**
   * Saves the current thread manager state to an encrypted file
   */
  async saveState(): Promise<void> {
    try {
      const state: IThreadState = {
        workloads: [...this.threadWorkLoads],
        operations: this.operationCounter,
        lastUpdated: new Date().toISOString(),
        activeThreads: this.threads.length,
        metadata: { ...this.metadata },
      };

      // Ensure directory exists
      await fileSystem.ensureDir(path.dirname(this.options.statePath));

      // Encrypt and save
      const stateJson = JSON.stringify(state);
      const encryptedState = await encryption.encrypt(stateJson, this.options.encryptionPassword);

      await fileSystem.writeFile(this.options.statePath, encryptedState, { encoding: "utf8" });
    } catch (error) {
      console.error("Failed to save thread manager state:", error);
    }
  }

  /**
   * Loads thread manager state from an encrypted file
   */
  async loadState(): Promise<boolean> {
    try {
      // Check if state file exists
      if (!(await fileSystem.exists(this.options.statePath))) {
        return false;
      }

      // Read and decrypt
      const encryptedState = (await fileSystem.readFile(this.options.statePath, {
        encoding: "utf8",
      })) as string;
      const decryptedJson = (await encryption.decrypt(
        encryptedState,
        this.options.encryptionPassword,
        "utf8",
      )) as string;

      // Parse state
      const state = JSON.parse(decryptedJson) as IThreadState;

      // Restore metadata
      if (state.metadata) {
        this.metadata = { ...state.metadata };
      }

      // Restore operation counter
      this.operationCounter = state.operations || 0;

      return true;
    } catch (error) {
      console.warn("Failed to load thread manager state:", error);
      return false;
    }
  }

  /**
   * Starts the auto-save interval
   * @private
   */
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      this.saveState().catch(console.error);
    }, this.options.autoSaveInterval);
  }

  /**
   * Sets up process shutdown handlers
   * @private
   */
  private setupShutdownHandlers(): void {
    // Handle graceful shutdown
    const handleShutdown = async () => {
      if (this.isShuttingDown) return;

      console.log("ThreadsManager: Shutting down...");
      try {
        await this.terminateAll();
      } catch (error) {
        console.error("Error during ThreadsManager shutdown:", error);
      }
    };

    // Register handlers
    process.on("SIGINT", handleShutdown);
    process.on("SIGTERM", handleShutdown);
    process.on("beforeExit", handleShutdown);
  }
}

// Export singleton instance
export default ThreadsManager;
