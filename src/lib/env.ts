/**
 * Environment configuration with validation
 * Centralizes all environment variable access with type safety
 */

interface EnvConfig {
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseProjectId: string;
  
  // Optional integrations
  sentryDsn?: string;
  gaMeasurementId?: string;
  stripePublishableKey?: string;
  mapboxToken?: string;
  
  // App config
  isProduction: boolean;
  isDevelopment: boolean;
  mode: string;
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

function getRequiredEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new EnvironmentError(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string): string | undefined {
  return import.meta.env[key] || undefined;
}

// Validate and export environment configuration
export function validateEnv(): EnvConfig {
  const config: EnvConfig = {
    // Required Supabase config
    supabaseUrl: getRequiredEnv('VITE_SUPABASE_URL'),
    supabaseAnonKey: getRequiredEnv('VITE_SUPABASE_PUBLISHABLE_KEY'),
    supabaseProjectId: getOptionalEnv('VITE_SUPABASE_PROJECT_ID') || '',
    
    // Optional integrations
    sentryDsn: getOptionalEnv('VITE_SENTRY_DSN'),
    gaMeasurementId: getOptionalEnv('VITE_GA_MEASUREMENT_ID'),
    stripePublishableKey: getOptionalEnv('VITE_STRIPE_PUBLISHABLE_KEY'),
    mapboxToken: getOptionalEnv('VITE_MAPBOX_TOKEN'),
    
    // App mode
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
    mode: import.meta.env.MODE,
  };

  // Log configuration status in development
  if (config.isDevelopment) {
    console.log('[Env] Configuration validated:', {
      supabase: !!config.supabaseUrl,
      sentry: !!config.sentryDsn,
      analytics: !!config.gaMeasurementId,
      stripe: !!config.stripePublishableKey,
      mapbox: !!config.mapboxToken,
      mode: config.mode,
    });
  }

  return config;
}

// Singleton instance
let envConfig: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!envConfig) {
    envConfig = validateEnv();
  }
  return envConfig;
}

// Feature flags based on environment
export function isFeatureEnabled(feature: string): boolean {
  const env = getEnv();
  
  switch (feature) {
    case 'sentry':
      return env.isProduction && !!env.sentryDsn;
    case 'analytics':
      return !!env.gaMeasurementId;
    case 'stripe':
      return !!env.stripePublishableKey;
    case 'mapbox':
      return !!env.mapboxToken;
    default:
      return false;
  }
}

// Export for direct usage
export const env = getEnv();
