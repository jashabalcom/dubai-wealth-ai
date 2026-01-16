/**
 * Performance Metrics Hook
 * Tracks API response times, cache hit rates, and error rates
 * For production monitoring at scale
 */

import { useCallback, useEffect, useRef } from 'react';
import { redisCache } from '@/lib/redis-cache';

interface PerformanceEntry {
  name: string;
  duration: number;
  timestamp: number;
  status: 'success' | 'error';
}

interface PerformanceMetrics {
  totalRequests: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  cacheSize: number;
}

class PerformanceTracker {
  private entries: PerformanceEntry[] = [];
  private maxEntries = 1000;
  private flushInterval: number | null = null;

  constructor() {
    // Periodically trim old entries
    if (typeof window !== 'undefined') {
      this.flushInterval = window.setInterval(() => this.cleanup(), 60000);
    }
  }

  track(name: string, duration: number, status: 'success' | 'error' = 'success'): void {
    this.entries.push({
      name,
      duration,
      timestamp: Date.now(),
      status,
    });

    // Keep only recent entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  getMetrics(timeWindowMs: number = 300000): PerformanceMetrics {
    const now = Date.now();
    const recentEntries = this.entries.filter(e => now - e.timestamp < timeWindowMs);
    const cacheStats = redisCache.getStats();

    if (recentEntries.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        p95ResponseTime: 0,
        errorRate: 0,
        cacheHitRate: cacheStats.hitRate,
        cacheSize: cacheStats.localSize,
      };
    }

    const durations = recentEntries.map(e => e.duration).sort((a, b) => a - b);
    const errors = recentEntries.filter(e => e.status === 'error').length;
    const p95Index = Math.floor(durations.length * 0.95);

    return {
      totalRequests: recentEntries.length,
      avgResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95ResponseTime: durations[p95Index] || durations[durations.length - 1],
      errorRate: errors / recentEntries.length,
      cacheHitRate: cacheStats.hitRate,
      cacheSize: cacheStats.localSize,
    };
  }

  getEndpointMetrics(endpoint: string, timeWindowMs: number = 300000): PerformanceMetrics | null {
    const now = Date.now();
    const recentEntries = this.entries.filter(
      e => e.name === endpoint && now - e.timestamp < timeWindowMs
    );

    if (recentEntries.length === 0) return null;

    const durations = recentEntries.map(e => e.duration).sort((a, b) => a - b);
    const errors = recentEntries.filter(e => e.status === 'error').length;
    const p95Index = Math.floor(durations.length * 0.95);

    return {
      totalRequests: recentEntries.length,
      avgResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95ResponseTime: durations[p95Index] || durations[durations.length - 1],
      errorRate: errors / recentEntries.length,
      cacheHitRate: 0,
      cacheSize: 0,
    };
  }

  private cleanup(): void {
    const oneHourAgo = Date.now() - 3600000;
    this.entries = this.entries.filter(e => e.timestamp > oneHourAgo);
  }

  destroy(): void {
    if (this.flushInterval !== null) {
      clearInterval(this.flushInterval);
    }
  }
}

// Singleton instance
const performanceTracker = new PerformanceTracker();

/**
 * Hook to track and retrieve performance metrics
 */
export function usePerformanceMetrics() {
  const trackRef = useRef(performanceTracker);

  useEffect(() => {
    return () => {
      // Cleanup on unmount if needed
    };
  }, []);

  const trackRequest = useCallback((
    name: string,
    duration: number,
    status: 'success' | 'error' = 'success'
  ) => {
    trackRef.current.track(name, duration, status);
  }, []);

  const getMetrics = useCallback((timeWindowMs?: number) => {
    return trackRef.current.getMetrics(timeWindowMs);
  }, []);

  const getEndpointMetrics = useCallback((endpoint: string, timeWindowMs?: number) => {
    return trackRef.current.getEndpointMetrics(endpoint, timeWindowMs);
  }, []);

  return {
    trackRequest,
    getMetrics,
    getEndpointMetrics,
  };
}

/**
 * Utility function for timing async operations
 */
export async function withTiming<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await operation();
    performanceTracker.track(name, performance.now() - start, 'success');
    return result;
  } catch (error) {
    performanceTracker.track(name, performance.now() - start, 'error');
    throw error;
  }
}

/**
 * HOC for timing React Query operations
 */
export function createTimedQueryFn<T>(
  name: string,
  queryFn: () => Promise<T>
): () => Promise<T> {
  return async () => {
    const start = performance.now();
    try {
      const result = await queryFn();
      performanceTracker.track(name, performance.now() - start, 'success');
      return result;
    } catch (error) {
      performanceTracker.track(name, performance.now() - start, 'error');
      throw error;
    }
  };
}

export { performanceTracker };
