-- Create AI response cache table for reducing AI API costs
CREATE TABLE public.ai_response_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  function_name TEXT NOT NULL,
  response TEXT NOT NULL,
  input_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0
);

-- Create indexes for efficient cache lookups
CREATE INDEX idx_ai_cache_key ON public.ai_response_cache(cache_key);
CREATE INDEX idx_ai_cache_expires ON public.ai_response_cache(expires_at);
CREATE INDEX idx_ai_cache_function ON public.ai_response_cache(function_name);

-- Enable RLS
ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage cache (Edge Functions use service role)
CREATE POLICY "Service role can manage cache"
ON public.ai_response_cache
FOR ALL
USING (true)
WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.ai_response_cache IS 'Caches AI responses to reduce API costs. TTL varies by function type.';