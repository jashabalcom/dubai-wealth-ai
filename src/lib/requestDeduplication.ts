/**
 * Request Deduplication Utility
 * 
 * Prevents duplicate API calls during rapid navigation or re-renders.
 * Returns existing promise for in-flight requests with the same key.
 */

interface InFlightRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestDeduplicator {
  private inFlightRequests = new Map<string, InFlightRequest<unknown>>();
  private readonly maxAge: number;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(maxAgeMs = 30000) {
    this.maxAge = maxAgeMs;
    this.startCleanup();
  }

  /**
   * Execute a request with deduplication
   * If a request with the same key is in-flight, returns the existing promise
   */
  async dedupe<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check for existing in-flight request
    const existing = this.inFlightRequests.get(key);
    if (existing && Date.now() - existing.timestamp < this.maxAge) {
      console.log(`[Dedup] Returning in-flight request: ${key}`);
      return existing.promise as Promise<T>;
    }

    // Create new request
    console.log(`[Dedup] New request: ${key}`);
    const promise = requestFn()
      .then((result) => {
        // Remove from in-flight after completion
        this.inFlightRequests.delete(key);
        return result;
      })
      .catch((error) => {
        // Remove from in-flight on error
        this.inFlightRequests.delete(key);
        throw error;
      });

    this.inFlightRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Generate a cache key from function name and arguments
   */
  generateKey(name: string, args?: Record<string, unknown>): string {
    if (!args || Object.keys(args).length === 0) {
      return name;
    }
    return `${name}:${JSON.stringify(args)}`;
  }

  /**
   * Check if a request is currently in-flight
   */
  isInFlight(key: string): boolean {
    const existing = this.inFlightRequests.get(key);
    return !!existing && Date.now() - existing.timestamp < this.maxAge;
  }

  /**
   * Get the number of in-flight requests
   */
  getInFlightCount(): number {
    return this.inFlightRequests.size;
  }

  /**
   * Clear all in-flight requests
   */
  clear(): void {
    this.inFlightRequests.clear();
    console.log('[Dedup] Cleared all in-flight requests');
  }

  /**
   * Start automatic cleanup of stale requests
   */
  private startCleanup(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, request] of this.inFlightRequests.entries()) {
        if (now - request.timestamp > this.maxAge) {
          this.inFlightRequests.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`[Dedup] Cleaned ${cleaned} stale requests`);
      }
    }, 60000); // Cleanup every minute
  }

  /**
   * Stop cleanup and clear resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Singleton instance
export const requestDeduplicator = new RequestDeduplicator();

/**
 * Higher-order function to wrap any async function with deduplication
 */
export function withDeduplication<T, A extends Record<string, unknown>>(
  name: string,
  fn: (args?: A) => Promise<T>
): (args?: A) => Promise<T> {
  return (args?: A) => {
    const key = requestDeduplicator.generateKey(name, args);
    return requestDeduplicator.dedupe(key, () => fn(args));
  };
}

/**
 * Decorator-style deduplication for class methods
 */
export function createDedupedFetcher<T>(
  name: string,
  fetcher: () => Promise<T>
): () => Promise<T> {
  return () => {
    return requestDeduplicator.dedupe(name, fetcher);
  };
}
