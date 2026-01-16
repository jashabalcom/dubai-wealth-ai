
-- =====================================================
-- PHASE 1: SECURITY HARDENING MIGRATION (v3)
-- =====================================================

-- 1. Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- 4. RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()));

-- 5. Fix ab_assignments policy
DROP POLICY IF EXISTS "Anyone can create assignments" ON public.ab_assignments;
CREATE POLICY "Anyone can create ab assignments with constraints"
  ON public.ab_assignments FOR INSERT TO public
  WITH CHECK (experiment_id IS NOT NULL AND variant IS NOT NULL);

-- 6. Fix ab_events policy
DROP POLICY IF EXISTS "Anyone can create events" ON public.ab_events;
CREATE POLICY "Anyone can create ab events with constraints"
  ON public.ab_events FOR INSERT TO public
  WITH CHECK (event_name IS NOT NULL);

-- 7. Fix affiliate_clicks policy
DROP POLICY IF EXISTS "System can insert clicks" ON public.affiliate_clicks;
CREATE POLICY "Valid affiliate clicks only"
  ON public.affiliate_clicks FOR INSERT TO public
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.affiliates WHERE id = affiliate_id AND status = 'approved')
  );

-- 8. Fix email_subscribers policy
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscribers;
CREATE POLICY "Valid email subscriptions only"
  ON public.email_subscribers FOR INSERT TO public
  WITH CHECK (email IS NOT NULL AND email != '');

-- 9. Fix property_inquiries policy
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.property_inquiries;
CREATE POLICY "Valid property inquiries only"
  ON public.property_inquiries FOR INSERT TO public
  WITH CHECK (
    (auth.uid() IS NOT NULL OR (email IS NOT NULL OR phone IS NOT NULL))
    AND property_id IS NOT NULL
  );

-- 10. Fix property_views policy
DROP POLICY IF EXISTS "Anyone can create views" ON public.property_views;
CREATE POLICY "Valid property views only"
  ON public.property_views FOR INSERT TO public
  WITH CHECK (property_id IS NOT NULL);

-- 11. Fix user_feedback policy
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.user_feedback;
CREATE POLICY "Valid feedback submissions"
  ON public.user_feedback FOR INSERT TO public
  WITH CHECK (description IS NOT NULL AND description != '' AND category IS NOT NULL);

-- 12. Create security_audit_log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  resource_type TEXT,
  resource_id TEXT,
  action TEXT,
  outcome TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.security_audit_log;
CREATE POLICY "Admins can view audit logs"
  ON public.security_audit_log FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Service role inserts audit logs" ON public.security_audit_log;
CREATE POLICY "Service role inserts audit logs"
  ON public.security_audit_log FOR INSERT TO service_role
  WITH CHECK (true);

-- 13. Add index on existing rate_limits.key column
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON public.rate_limits(expires_at);

-- 14. Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event ON public.security_audit_log(event_type);

-- 15. Cleanup function using correct column name
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

-- 16. Grants
GRANT SELECT ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
