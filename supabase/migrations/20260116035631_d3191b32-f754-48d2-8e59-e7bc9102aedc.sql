-- Fix remaining overly permissive RLS policies on system tables
-- These should only allow service_role inserts, not public

-- 1. Fix ai_response_cache - only service_role should manage
DROP POLICY IF EXISTS "Service role can manage cache" ON public.ai_response_cache;
CREATE POLICY "Service role manages cache" ON public.ai_response_cache
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Fix rate_limits - only service_role should manage
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;
CREATE POLICY "Service role manages rate limits" ON public.rate_limits
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. Fix sensitive_data_access_log - only service_role should insert
DROP POLICY IF EXISTS "System can insert audit logs" ON public.sensitive_data_access_log;
CREATE POLICY "Service role inserts sensitive data logs" ON public.sensitive_data_access_log
FOR INSERT TO service_role WITH CHECK (true);