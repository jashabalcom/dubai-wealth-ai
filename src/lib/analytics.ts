// Google Analytics 4 integration

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Initialize GA4 with your Measurement ID
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Track page views
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window.gtag !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Common events for the platform
export const trackSignUp = (method: string) => {
  event({ action: 'sign_up', category: 'engagement', label: method });
};

export const trackLogin = (method: string) => {
  event({ action: 'login', category: 'engagement', label: method });
};

export const trackPropertyView = (propertyId: string, propertyName: string) => {
  event({ action: 'view_item', category: 'properties', label: propertyName, value: undefined });
};

export const trackPropertyInquiry = (propertyId: string) => {
  event({ action: 'generate_lead', category: 'properties', label: propertyId });
};

export const trackCalculatorUse = (calculatorType: string) => {
  event({ action: 'use_calculator', category: 'tools', label: calculatorType });
};

export const trackCourseStart = (courseId: string, courseName: string) => {
  event({ action: 'begin_course', category: 'academy', label: courseName });
};

export const trackLessonComplete = (lessonId: string, lessonName: string) => {
  event({ action: 'complete_lesson', category: 'academy', label: lessonName });
};

export const trackSubscription = (tier: string) => {
  event({ action: 'purchase', category: 'subscription', label: tier });
};
