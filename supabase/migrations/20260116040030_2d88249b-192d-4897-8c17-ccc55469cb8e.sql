-- Fix the last overly permissive RLS policy on referrals table
-- The "System can manage referrals" policy with USING(true) for public is dangerous

DROP POLICY IF EXISTS "System can manage referrals" ON public.referrals;

-- Create proper service_role only policy for system management
CREATE POLICY "Service role manages referrals" ON public.referrals
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Users should only be able to view their own referral records
CREATE POLICY "Users can view their own referrals" ON public.referrals
FOR SELECT TO authenticated USING (
  referred_user_id = auth.uid() OR 
  affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
);