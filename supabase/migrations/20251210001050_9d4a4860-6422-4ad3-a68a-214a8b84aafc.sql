-- ===========================================
-- SECURITY FIX: Restrict Profiles Table PII Exposure
-- ===========================================

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can view their own full profile (all columns)
CREATE POLICY "Users can view own full profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Users can view limited public data of visible members
-- Note: RLS policies can't restrict columns, so we rely on frontend/API to filter
-- But this at least ensures only visible profiles are accessible to others
CREATE POLICY "Users can view visible member profiles" 
ON public.profiles 
FOR SELECT 
USING (
  is_visible_in_directory = true
);

-- ===========================================
-- SECURITY FIX: Golden Visa Submissions
-- ===========================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can create submissions" ON public.golden_visa_submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.golden_visa_submissions;
DROP POLICY IF EXISTS "Anyone can create submissions" ON public.golden_visa_submissions;

-- Require authenticated users with matching user_id for inserts
CREATE POLICY "Authenticated users can create own submissions" 
ON public.golden_visa_submissions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Users can only view their own submissions
CREATE POLICY "Users can view own submissions" 
ON public.golden_visa_submissions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions" 
ON public.golden_visa_submissions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- ===========================================
-- SECURITY FIX: Admin Activity Log
-- ===========================================

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "System can insert activity log" ON public.admin_activity_log;
DROP POLICY IF EXISTS "Anyone can insert activity log" ON public.admin_activity_log;

-- Only admins can insert activity logs
CREATE POLICY "Admins can insert activity log" 
ON public.admin_activity_log 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));