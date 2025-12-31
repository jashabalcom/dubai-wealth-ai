import { SubscriptionTier } from './stripe-config';

export interface FunnelConfig {
  trialDays: number;
  defaultTier: SubscriptionTier;
  allowedTiers: SubscriptionTier[];
  headline: string;
  subheadline: string;
  ctaText: string;
  showAnnualOption: boolean;
  urgencyText?: string;
  bonuses?: string[];
}

export const FUNNEL_CONFIGS: Record<string, FunnelConfig> = {
  webinar: {
    trialDays: 7,
    defaultTier: 'investor',
    allowedTiers: ['investor', 'elite'],
    headline: "Exclusive Webinar Offer",
    subheadline: "Thank you for attending! Start your 7-day free trial today.",
    ctaText: "Start 7-Day Free Trial",
    showAnnualOption: false,
    urgencyText: "Offer expires in 48 hours",
    bonuses: ["Exclusive webinar replay access", "Bonus market report"],
  },
  'lead-magnet': {
    trialDays: 14,
    defaultTier: 'investor',
    allowedTiers: ['investor', 'elite', 'private'],
    headline: "Unlock Your Full Report",
    subheadline: "Get instant access with a 14-day free trial.",
    ctaText: "Start 14-Day Free Trial",
    showAnnualOption: true,
    bonuses: ["Complete market analysis PDF", "Weekly market updates"],
  },
  partner: {
    trialDays: 30,
    defaultTier: 'elite',
    allowedTiers: ['elite', 'private'],
    headline: "Partner Exclusive Access",
    subheadline: "As a valued partner referral, enjoy 30 days free.",
    ctaText: "Claim 30-Day Free Trial",
    showAnnualOption: true,
    urgencyText: "Limited partner spots available",
    bonuses: ["Priority support", "1-on-1 onboarding call", "Exclusive partner community"],
  },
  'special-offer': {
    trialDays: 14,
    defaultTier: 'elite',
    allowedTiers: ['investor', 'elite'],
    headline: "Limited Time Offer",
    subheadline: "Start your 14-day free trial with full Elite access.",
    ctaText: "Start Free Trial",
    showAnnualOption: true,
    urgencyText: "Only 50 spots remaining",
  },
  'youtube': {
    trialDays: 7,
    defaultTier: 'investor',
    allowedTiers: ['investor', 'elite'],
    headline: "YouTube Subscriber Special",
    subheadline: "Thank you for being a subscriber! Try us free for 7 days.",
    ctaText: "Start 7-Day Free Trial",
    showAnnualOption: false,
  },
  'podcast': {
    trialDays: 14,
    defaultTier: 'investor',
    allowedTiers: ['investor', 'elite'],
    headline: "Podcast Listener Exclusive",
    subheadline: "Claim your 14-day free trial as a podcast listener.",
    ctaText: "Start 14-Day Free Trial",
    showAnnualOption: true,
    bonuses: ["Exclusive podcast episode archive"],
  },
};

export type FunnelType = keyof typeof FUNNEL_CONFIGS;

export const isValidFunnel = (funnel: string): funnel is FunnelType => {
  return funnel in FUNNEL_CONFIGS;
};

export const getFunnelConfig = (funnel: string): FunnelConfig | null => {
  if (isValidFunnel(funnel)) {
    return FUNNEL_CONFIGS[funnel];
  }
  return null;
};

// Valid trial sources for the backend
export const VALID_TRIAL_SOURCES = Object.keys(FUNNEL_CONFIGS);
