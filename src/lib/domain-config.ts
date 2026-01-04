// Domain configuration for Dubai Real Estate Investor Platform
// This allows easy domain switching between staging and production

export const DOMAIN_CONFIG = {
  // Base URL - reads from environment variable, falls back to staging
  baseUrl: import.meta.env.VITE_SITE_URL || 'https://dubai.majorleadsagency.com',
  
  // Site identity
  siteName: 'Dubai Real Estate Investor',
  tagline: 'AI-Powered Real Estate Investment Platform',
  
  // Branding
  author: 'Balcom Privé',
  locale: 'en_US',
  geoRegion: 'AE-DU',
  geoPlacename: 'Dubai',
  
  // Social handles
  twitter: '@DubaiREInvestor',
  
  // Contact emails (use domain variable in edge functions)
  supportEmail: 'support@dubairealestateinvestor.com',
  privacyEmail: 'privacy@dubairealestateinvestor.com',
  investEmail: 'invest@dubairealestateinvestor.com',
} as const;

// Helper to generate full URLs
export const getFullUrl = (path: string): string => {
  const base = DOMAIN_CONFIG.baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

// OG Image URL
export const getOgImageUrl = (): string => {
  return getFullUrl('/images/og-image.png');
};
