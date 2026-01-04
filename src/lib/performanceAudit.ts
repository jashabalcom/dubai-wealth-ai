/**
 * Performance Audit Utilities
 * Tools for measuring and optimizing app performance
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
}

export interface AuditResult {
  score: number;
  metrics: PerformanceMetric[];
  recommendations: string[];
}

/**
 * Get rating based on Core Web Vitals thresholds
 */
function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  const threshold = thresholds[metric];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Run a performance audit on the current page
 */
export async function runPerformanceAudit(): Promise<AuditResult> {
  const metrics: PerformanceMetric[] = [];
  const recommendations: string[] = [];

  // Get navigation timing
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  
  if (navEntry) {
    // TTFB
    const ttfb = navEntry.responseStart - navEntry.requestStart;
    const ttfbRating = getRating('TTFB', ttfb);
    metrics.push({ name: 'TTFB', value: Math.round(ttfb), rating: ttfbRating, unit: 'ms' });
    if (ttfbRating !== 'good') {
      recommendations.push('Optimize server response time - consider caching, CDN, or server-side optimizations');
    }

    // DOM Content Loaded
    const dcl = navEntry.domContentLoadedEventEnd - navEntry.startTime;
    metrics.push({ name: 'DOM Content Loaded', value: Math.round(dcl), rating: getRating('FCP', dcl), unit: 'ms' });

    // Load Complete
    const loadComplete = navEntry.loadEventEnd - navEntry.startTime;
    metrics.push({ name: 'Page Load', value: Math.round(loadComplete), rating: loadComplete < 3000 ? 'good' : loadComplete < 5000 ? 'needs-improvement' : 'poor', unit: 'ms' });
  }

  // Get paint timing
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
  if (fcpEntry) {
    const fcpRating = getRating('FCP', fcpEntry.startTime);
    metrics.push({ name: 'FCP', value: Math.round(fcpEntry.startTime), rating: fcpRating, unit: 'ms' });
    if (fcpRating !== 'good') {
      recommendations.push('Improve First Contentful Paint - reduce render-blocking resources, optimize critical CSS');
    }
  }

  // Resource analysis
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const jsResources = resources.filter(r => r.initiatorType === 'script');
  const cssResources = resources.filter(r => r.initiatorType === 'link' || r.initiatorType === 'css');
  const imageResources = resources.filter(r => r.initiatorType === 'img');

  const totalJsSize = jsResources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
  const totalCssSize = cssResources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
  const totalImageSize = imageResources.reduce((acc, r) => acc + (r.transferSize || 0), 0);

  // JS bundle size check
  const jsSizeKB = totalJsSize / 1024;
  metrics.push({
    name: 'JS Bundle Size',
    value: Math.round(jsSizeKB),
    rating: jsSizeKB < 300 ? 'good' : jsSizeKB < 500 ? 'needs-improvement' : 'poor',
    unit: 'KB',
  });
  if (jsSizeKB > 300) {
    recommendations.push('Consider code splitting and lazy loading to reduce initial JS bundle size');
  }

  // CSS size check
  const cssSizeKB = totalCssSize / 1024;
  metrics.push({
    name: 'CSS Size',
    value: Math.round(cssSizeKB),
    rating: cssSizeKB < 100 ? 'good' : cssSizeKB < 200 ? 'needs-improvement' : 'poor',
    unit: 'KB',
  });

  // Image optimization check
  const imageSizeKB = totalImageSize / 1024;
  metrics.push({
    name: 'Images Size',
    value: Math.round(imageSizeKB),
    rating: imageSizeKB < 500 ? 'good' : imageSizeKB < 1000 ? 'needs-improvement' : 'poor',
    unit: 'KB',
  });
  if (imageSizeKB > 500) {
    recommendations.push('Optimize images - use WebP format, lazy loading, and appropriate sizing');
  }

  // Resource count
  metrics.push({
    name: 'Total Requests',
    value: resources.length,
    rating: resources.length < 50 ? 'good' : resources.length < 80 ? 'needs-improvement' : 'poor',
    unit: 'requests',
  });
  if (resources.length > 50) {
    recommendations.push('Reduce number of HTTP requests - combine files, use sprites, inline small assets');
  }

  // Check for long tasks (if available)
  if ('PerformanceObserver' in window) {
    try {
      const longTasks = performance.getEntriesByType('longtask');
      if (longTasks.length > 0) {
        const maxLongTask = Math.max(...longTasks.map(t => t.duration));
        metrics.push({
          name: 'Longest Task',
          value: Math.round(maxLongTask),
          rating: maxLongTask < 50 ? 'good' : maxLongTask < 100 ? 'needs-improvement' : 'poor',
          unit: 'ms',
        });
        if (maxLongTask > 50) {
          recommendations.push('Break up long tasks - use requestIdleCallback or web workers for heavy computations');
        }
      }
    } catch {
      // Long task API not supported
    }
  }

  // Calculate overall score
  const goodCount = metrics.filter(m => m.rating === 'good').length;
  const score = Math.round((goodCount / metrics.length) * 100);

  // Add general recommendations if score is low
  if (score < 70) {
    if (!recommendations.some(r => r.includes('caching'))) {
      recommendations.push('Enable browser caching with appropriate cache headers');
    }
    if (!recommendations.some(r => r.includes('compression'))) {
      recommendations.push('Ensure GZIP/Brotli compression is enabled on the server');
    }
  }

  return { score, metrics, recommendations };
}

/**
 * Monitor memory usage (if available)
 */
export function getMemoryUsage(): { usedJSHeapSize: number; totalJSHeapSize: number } | null {
  const perf = performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } };
  if (perf.memory) {
    return {
      usedJSHeapSize: Math.round(perf.memory.usedJSHeapSize / 1024 / 1024),
      totalJSHeapSize: Math.round(perf.memory.totalJSHeapSize / 1024 / 1024),
    };
  }
  return null;
}

/**
 * Check for common performance anti-patterns in the DOM
 */
export function checkDOMHealth(): { issue: string; severity: 'warn' | 'error' }[] {
  const issues: { issue: string; severity: 'warn' | 'error' }[] = [];

  // Check DOM depth
  const maxDepth = getMaxDOMDepth(document.body);
  if (maxDepth > 15) {
    issues.push({ issue: `Deep DOM nesting (${maxDepth} levels) - flatten component structure`, severity: 'warn' });
  }

  // Check total DOM nodes
  const totalNodes = document.querySelectorAll('*').length;
  if (totalNodes > 1500) {
    issues.push({ issue: `Large DOM (${totalNodes} nodes) - consider virtualization`, severity: totalNodes > 3000 ? 'error' : 'warn' });
  }

  // Check for layout thrashing patterns
  const forceLayoutSelectors = document.querySelectorAll('[style*="width"], [style*="height"]');
  if (forceLayoutSelectors.length > 50) {
    issues.push({ issue: 'Many inline styles detected - use CSS classes instead', severity: 'warn' });
  }

  return issues;
}

function getMaxDOMDepth(element: Element, depth = 0): number {
  if (!element.children.length) return depth;
  return Math.max(...Array.from(element.children).map(child => getMaxDOMDepth(child, depth + 1)));
}
