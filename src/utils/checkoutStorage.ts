/**
 * Secure checkout storage utility using sessionStorage
 * - Auto-clears when browser tab closes
 * - TTL validation to prevent stale data
 * - Type-safe getters/setters
 */

import type { BillingPeriod } from '@/lib/stripe-config';

export interface PendingCheckout {
  tier: 'investor' | 'elite' | 'private';
  billing: BillingPeriod;
  isUpgrade?: boolean;
  createdAt: number;
}

// 30 minutes TTL for checkout data
const CHECKOUT_TTL_MS = 30 * 60 * 1000;

const STORAGE_KEYS = {
  pending: 'pending_checkout',
  oauthIntent: 'pending_oauth_checkout',
  inquirySlug: 'pending_inquiry_property_slug',
} as const;

/**
 * Check if checkout data is still valid (not expired)
 */
function isValidCheckout(checkout: PendingCheckout): boolean {
  const now = Date.now();
  return now - checkout.createdAt < CHECKOUT_TTL_MS;
}

/**
 * Safely parse JSON from storage
 */
function safeParseJSON<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export const checkoutStorage = {
  /**
   * Store pending checkout data
   */
  setPending(data: Omit<PendingCheckout, 'createdAt'>): void {
    const checkout: PendingCheckout = {
      ...data,
      createdAt: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEYS.pending, JSON.stringify(checkout));
  },

  /**
   * Get pending checkout if valid, otherwise clear and return null
   */
  getPending(): PendingCheckout | null {
    const stored = sessionStorage.getItem(STORAGE_KEYS.pending);
    const checkout = safeParseJSON<PendingCheckout>(stored);
    
    if (!checkout) return null;
    
    // Validate TTL
    if (!isValidCheckout(checkout)) {
      this.clearPending();
      return null;
    }
    
    return checkout;
  },

  /**
   * Clear pending checkout data
   */
  clearPending(): void {
    sessionStorage.removeItem(STORAGE_KEYS.pending);
  },

  /**
   * Set OAuth checkout intent flag
   */
  setOAuthIntent(value: boolean): void {
    if (value) {
      sessionStorage.setItem(STORAGE_KEYS.oauthIntent, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.oauthIntent);
    }
  },

  /**
   * Check and clear OAuth intent
   */
  consumeOAuthIntent(): boolean {
    const intent = sessionStorage.getItem(STORAGE_KEYS.oauthIntent);
    if (intent) {
      sessionStorage.removeItem(STORAGE_KEYS.oauthIntent);
      return true;
    }
    return false;
  },

  /**
   * Set pending property inquiry slug
   */
  setInquirySlug(slug: string): void {
    sessionStorage.setItem(STORAGE_KEYS.inquirySlug, slug);
  },

  /**
   * Get and clear pending inquiry slug
   */
  consumeInquirySlug(): string | null {
    const slug = sessionStorage.getItem(STORAGE_KEYS.inquirySlug);
    if (slug) {
      sessionStorage.removeItem(STORAGE_KEYS.inquirySlug);
    }
    return slug;
  },

  /**
   * Clear all checkout-related data
   */
  clearAll(): void {
    this.clearPending();
    sessionStorage.removeItem(STORAGE_KEYS.oauthIntent);
    sessionStorage.removeItem(STORAGE_KEYS.inquirySlug);
  },
};
