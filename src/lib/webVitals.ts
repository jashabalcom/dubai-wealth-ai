import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import * as Sentry from '@sentry/react';
import { useWebVitalsStore } from '@/stores/webVitalsStore';

function sendToAnalytics(metric: Metric) {
  const vitalsData = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  };

  // Store in zustand for dashboard access
  try {
    useWebVitalsStore.getState().recordVital(metric);
  } catch (e) {
    // Store may not be initialized yet during early load
  }

  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: Math.round(metric.value),
      rating: metric.rating,
    });
  }

  // Send to Sentry as custom measurement
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`,
      level: metric.rating === 'poor' ? 'warning' : 'info',
      data: vitalsData as Record<string, unknown>,
    });

    // Report poor vitals as performance issues
    if (metric.rating === 'poor') {
      Sentry.captureMessage(`Poor ${metric.name}: ${Math.round(metric.value)}ms`, {
        level: 'warning',
        tags: {
          vital: metric.name,
          rating: metric.rating,
        },
        extra: vitalsData as Record<string, unknown>,
      });
    }
  }

  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
    (window as WindowWithGtag).gtag!('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

export function initWebVitals() {
  try {
    // Core Web Vitals
    onCLS(sendToAnalytics);  // Cumulative Layout Shift
    onINP(sendToAnalytics);  // Interaction to Next Paint
    onLCP(sendToAnalytics);  // Largest Contentful Paint
    
    // Other vitals
    onFCP(sendToAnalytics);  // First Contentful Paint
    onTTFB(sendToAnalytics); // Time to First Byte

    console.log('[Web Vitals] Monitoring initialized');
  } catch (error) {
    console.error('[Web Vitals] Failed to initialize:', error);
  }
}

// Type for window with gtag - using type alias instead of interface
type WindowWithGtag = Window & {
  gtag?: (...args: unknown[]) => void;
};
