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
  params,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
  params?: Record<string, unknown>;
}) => {
  if (typeof window.gtag !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      send_to: GA_MEASUREMENT_ID,
      ...params,
    });
  }
};

// ============================================
// CONVERSION TRACKING EVENTS
// ============================================

// Track sign-up conversions
export const trackSignUp = (method: string) => {
  event({ 
    action: 'sign_up', 
    category: 'engagement', 
    label: method,
    params: {
      method: method,
    }
  });
};

// Track login events
export const trackLogin = (method: string) => {
  event({ action: 'login', category: 'engagement', label: method });
};

// Track property view
export const trackPropertyView = (propertyId: string, propertyName: string, area?: string, price?: number) => {
  event({ 
    action: 'view_item', 
    category: 'properties', 
    label: propertyName,
    params: {
      item_id: propertyId,
      item_name: propertyName,
      item_category: area,
      price: price,
      currency: 'AED',
    }
  });
};

// Track property inquiry conversions (KEY CONVERSION)
export const trackPropertyInquiry = (
  propertyId: string,
  propertyName: string,
  inquiryType: 'viewing' | 'enquiry',
  area?: string,
  price?: number
) => {
  event({ 
    action: 'generate_lead', 
    category: 'properties', 
    label: `${inquiryType}_${propertyId}`,
    params: {
      item_id: propertyId,
      item_name: propertyName,
      inquiry_type: inquiryType,
      item_category: area,
      value: price,
      currency: 'AED',
      lead_source: 'property_detail',
    }
  });
};

// Track lead magnet downloads (KEY CONVERSION)
export const trackLeadMagnetDownload = (
  leadMagnetType: 'property_deal_breakdown' | 'neighborhood_picks' | 'investor_guide' | 'exit_intent_guide',
  source: string,
  investorIntent?: string,
  itemName?: string
) => {
  event({
    action: 'lead_capture',
    category: 'leadgen',
    label: leadMagnetType,
    params: {
      lead_magnet_type: leadMagnetType,
      source: source,
      investor_intent: investorIntent,
      content_name: itemName,
    }
  });
};

// Track subscription purchase (KEY CONVERSION with revenue)
export const trackSubscription = (
  tier: string,
  billingPeriod: 'monthly' | 'annual',
  value: number,
  isUpgrade: boolean = false
) => {
  event({
    action: 'purchase',
    category: 'subscription',
    label: tier,
    value: value,
    params: {
      transaction_id: `sub_${Date.now()}`,
      currency: 'USD',
      items: [{
        item_id: `${tier}_${billingPeriod}`,
        item_name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Membership (${billingPeriod})`,
        item_category: 'subscription',
        price: value,
        quantity: 1,
      }],
      subscription_tier: tier,
      billing_period: billingPeriod,
      is_upgrade: isUpgrade,
    }
  });
};

// Track trial start (KEY CONVERSION)
export const trackTrialStart = (tier: string, billingPeriod: 'monthly' | 'annual') => {
  event({
    action: 'begin_trial',
    category: 'subscription',
    label: tier,
    params: {
      subscription_tier: tier,
      billing_period: billingPeriod,
      trial_length_days: 14,
    }
  });
};

// ============================================
// ENGAGEMENT EVENTS
// ============================================

// Track calculator usage
export const trackCalculatorUse = (calculatorType: string) => {
  event({ action: 'use_calculator', category: 'tools', label: calculatorType });
};

// Track course start
export const trackCourseStart = (courseId: string, courseName: string) => {
  event({ 
    action: 'begin_course', 
    category: 'academy', 
    label: courseName,
    params: {
      course_id: courseId,
      course_name: courseName,
    }
  });
};

// Track lesson completion
export const trackLessonComplete = (lessonId: string, lessonName: string, courseId?: string) => {
  event({ 
    action: 'complete_lesson', 
    category: 'academy', 
    label: lessonName,
    params: {
      lesson_id: lessonId,
      lesson_name: lessonName,
      course_id: courseId,
    }
  });
};

// Track AI assistant usage
export const trackAIAssistantUse = (queryType: string) => {
  event({
    action: 'ai_query',
    category: 'ai_assistant',
    label: queryType,
  });
};

// Track community engagement
export const trackCommunityEngagement = (action: 'post' | 'comment' | 'like' | 'event_register', targetId?: string) => {
  event({
    action: `community_${action}`,
    category: 'community',
    label: targetId,
  });
};
