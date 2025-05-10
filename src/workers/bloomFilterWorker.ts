/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { parentPort, threadId } from "worker_threads";
import BloomFilter from "@/structs/BloomFilter";
import { BLOOM_FILTER_PATH, ENCRYPTION_KEY } from "@/core/config";

// Initialize BloomFilter
let bloomFilter: BloomFilter | null = null;
let initialized = false;

// Initialize the BloomFilter
async function initializeFilter(options: any = {}) {
  try {
    const {
      expectedElements = 10000,
      falsePositiveRate = 0.01,
      loadExisting = true,
      password = ENCRYPTION_KEY,
      statePath = BLOOM_FILTER_PATH,
    } = options;

    // Create the filter with specified settings
    bloomFilter = new BloomFilter(expectedElements);

    // Try to load existing state if requested
    if (loadExisting) {
      try {
        await bloomFilter.loadBloomFilterState(statePath, password);
        logger.info(`[Thread ${threadId}] Loaded existing BloomFilter state`);
      } catch (error) {
        logger.error(
          `[Thread ${threadId}] Creating new BloomFilter (no existing state found) - ${error}`,
        );
      }
    }

    return { success: true, message: "BloomFilter initialized successfully" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Check if an element exists in the BloomFilter
function checkExists(element: string): boolean {
  if (!bloomFilter) {
    throw new Error("BloomFilter not initialized");
  }
  return bloomFilter.has(element);
}

// Add an element to the BloomFilter
function addElement(element: string): boolean {
  if (!bloomFilter) {
    throw new Error("BloomFilter not initialized");
  }
  return bloomFilter.add(element);
}

// Add multiple elements to the BloomFilter
function addElements(elements: string[]): number {
  if (!bloomFilter) {
    throw new Error("BloomFilter not initialized");
  }
  return bloomFilter.addAll(elements);
}

// Save the current state
async function saveState(): Promise<any> {
  if (!bloomFilter) {
    throw new Error("BloomFilter not initialized");
  }

  await bloomFilter.saveBloomFilterState(BLOOM_FILTER_PATH, ENCRYPTION_KEY);
  return { success: true, message: "BloomFilter state saved successfully" };
}

// Handle messages from the main thread
parentPort?.on("message", async message => {
  const { action, payload, operationId } = message;

  try {
    let result;

    // Initialize the filter if not already done
    if (action !== "initialize" && !initialized && !bloomFilter) {
      await initializeFilter();
      initialized = true;
    }

    // Handle different actions
    switch (action) {
      case "initialize":
        result = await initializeFilter(payload);
        initialized = result.success;
        break;

      case "checkExists":
        result = { exists: checkExists(payload) };
        break;

      case "add":
        result = { added: addElement(payload) };
        break;

      case "addAll":
        result = { addedCount: addElements(payload) };
        break;

      case "save":
        result = await saveState();
        break;

      case "getStats":
        if (!bloomFilter) {
          throw new Error("BloomFilter not initialized");
        }
        result = {
          falsePositiveRate: bloomFilter.getFalsePositiveRate(),
          size: bloomFilter.export().size,
          numberOfHashFunctions: bloomFilter.export().numberOfHashFunctions,
        };
        break;

      case "shutdown":
        // Save state before shutting down
        if (bloomFilter) {
          await saveState();
        }
        result = { success: true, message: "Shutdown complete" };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Send the result back
    parentPort?.postMessage({
      data: result,
      threadId,
      operationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Send the error back
    parentPort?.postMessage({
      error: error instanceof Error ? error.message : String(error),
      threadId,
      operationId,
      timestamp: new Date().toISOString(),
    });
  }
});

// Signal that worker is ready
parentPort?.postMessage({
  data: { status: "ready", threadId },
  threadId,
  timestamp: new Date().toISOString(),
});
