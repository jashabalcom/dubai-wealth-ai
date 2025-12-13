-- Rate Limiting Infrastructure
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for efficient rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_window ON public.rate_limits(key, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON public.rate_limits(expires_at);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage rate limits
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Performance Indexes for 100K users
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
  ON public.notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation 
  ON public.direct_messages(sender_id, recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_full_name_gin 
  ON public.profiles USING gin(to_tsvector('english', COALESCE(full_name, '')));

-- Clean up expired rate limits (will be called by cron or manually)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE expires_at < now();
END;
$$;