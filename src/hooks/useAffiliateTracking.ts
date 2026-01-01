import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const COOKIE_NAME = 'dubai_rei_ref';
const COOKIE_DURATION_DAYS = 90;

// Set a cookie with expiration
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

// Get a cookie value
const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Hash IP for privacy (simple hash, actual hashing done server-side)
const getFingerprint = (): string => {
  const nav = window.navigator;
  const screen = window.screen;
  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset()
  ].join('|');
  return btoa(fingerprint).substring(0, 32);
};

export interface AffiliateInfo {
  referralCode: string | null;
  affiliateId: string | null;
  isReferred: boolean;
}

export const useAffiliateTracking = () => {
  const location = useLocation();

  // Track affiliate click
  const trackClick = useCallback(async (referralCode: string) => {
    try {
      const { error } = await supabase.functions.invoke('track-affiliate-click', {
        body: {
          referral_code: referralCode,
          landing_page: window.location.href,
          referrer_url: document.referrer || null,
          user_agent: navigator.userAgent,
          fingerprint: getFingerprint()
        }
      });

      if (error) {
        console.error('Error tracking affiliate click:', error);
      }
    } catch (err) {
      console.error('Failed to track affiliate click:', err);
    }
  }, []);

  // Check for referral parameter and set cookie
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref') || params.get('referral');

    if (refCode) {
      // Don't overwrite existing referral (first-touch attribution)
      const existingRef = getCookie(COOKIE_NAME);
      if (!existingRef) {
        setCookie(COOKIE_NAME, refCode.toUpperCase(), COOKIE_DURATION_DAYS);
        trackClick(refCode.toUpperCase());
      }
    }
  }, [location.search, trackClick]);

  // Get current referral info
  const getReferralInfo = useCallback((): AffiliateInfo => {
    const referralCode = getCookie(COOKIE_NAME);
    return {
      referralCode,
      affiliateId: null, // Will be resolved during signup
      isReferred: !!referralCode
    };
  }, []);

  // Clear referral (called after successful attribution)
  const clearReferral = useCallback(() => {
    document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }, []);

  // Get referral code for signup
  const getReferralCode = useCallback((): string | null => {
    return getCookie(COOKIE_NAME);
  }, []);

  return {
    getReferralInfo,
    getReferralCode,
    clearReferral,
    isReferred: !!getCookie(COOKIE_NAME)
  };
};
