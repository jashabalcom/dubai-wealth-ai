-- Fix overly permissive RLS policies on audit/system tables
-- These tables should only allow inserts from service_role, not public

-- 1. Fix api_key_audit_log - Remove public INSERT policy, keep admin SELECT
DROP POLICY IF EXISTS "Service can insert audit logs" ON public.api_key_audit_log;
CREATE POLICY "Service role inserts audit logs" ON public.api_key_audit_log
FOR INSERT TO service_role WITH CHECK (true);

-- 2. Fix notifications - Remove public INSERT policy, add proper service_role policy
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role inserts notifications" ON public.notifications
FOR INSERT TO service_role WITH CHECK (true);

-- 3. Fix referral_activity - Remove public INSERT policy, add proper service_role policy  
DROP POLICY IF EXISTS "System can insert activity" ON public.referral_activity;
CREATE POLICY "Service role inserts referral activity" ON public.referral_activity
FOR INSERT TO service_role WITH CHECK (true);

-- 4. Restrict demo_members from public read - only authenticated users should see
DROP POLICY IF EXISTS "Anyone can view demo members" ON public.demo_members;
CREATE POLICY "Authenticated users can view demo members" ON public.demo_members
FOR SELECT TO authenticated USING (true);