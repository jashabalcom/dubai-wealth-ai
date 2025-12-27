-- Add cookie_consent column to profiles table
-- Stores granular cookie preferences as JSONB
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cookie_consent jsonb DEFAULT NULL;

-- Add index for querying cookie consent
CREATE INDEX IF NOT EXISTS idx_profiles_cookie_consent ON public.profiles USING gin(cookie_consent);

COMMENT ON COLUMN public.profiles.cookie_consent IS 'Stores user cookie preferences: {essential: true, analytics: boolean, marketing: boolean, consented_at: timestamp, expires_at: timestamp}';