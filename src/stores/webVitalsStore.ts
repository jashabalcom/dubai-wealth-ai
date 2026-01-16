import { create } from 'zustand';
import type { Metric } from 'web-vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
}

interface WebVitalsState {
  vitals: {
    LCP?: VitalMetric;
    FCP?: VitalMetric;
    CLS?: VitalMetric;
    INP?: VitalMetric;
    TTFB?: VitalMetric;
  };
  history: VitalMetric[];
  recordVital: (metric: Metric) => void;
  getVital: (name: string) => VitalMetric | undefined;
  getHistory: (name?: string) => VitalMetric[];
  clearHistory: () => void;
}

const MAX_HISTORY = 100;

export const useWebVitalsStore = create<WebVitalsState>((set, get) => ({
  vitals: {},
  history: [],
  
  recordVital: (metric: Metric) => {
    const vitalMetric: VitalMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      vitals: {
        ...state.vitals,
        [metric.name]: vitalMetric,
      },
      history: [...state.history.slice(-MAX_HISTORY + 1), vitalMetric],
    }));
    
    // Log slow vitals for alerting
    if (metric.rating === 'poor') {
      console.warn(`[Web Vitals] Poor ${metric.name}: ${metric.value.toFixed(2)}`);
    }
  },
  
  getVital: (name: string) => {
    const vitals = get().vitals;
    return vitals[name as keyof typeof vitals];
  },
  
  getHistory: (name?: string) => {
    const history = get().history;
    if (!name) return history;
    return history.filter((v) => v.name === name);
  },
  
  clearHistory: () => {
    set({ history: [] });
  },
}));
