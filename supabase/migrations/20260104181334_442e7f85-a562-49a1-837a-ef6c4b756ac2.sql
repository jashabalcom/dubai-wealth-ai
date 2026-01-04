-- Phase 1: Critical Security Fixes

-- 1.1 Block direct public/anon access to agents table
-- Force all public access through security definer functions (get_public_agents, get_active_agents)
CREATE POLICY "Block anon direct access to agents"
ON public.agents
FOR SELECT
TO anon
USING (false);

-- 1.2 Create API key audit logging table
CREATE TABLE IF NOT EXISTS public.api_key_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id) ON DELETE SET NULL,
  user_id uuid,
  action text NOT NULL,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.api_key_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view API key audit logs"
ON public.api_key_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Edge functions can insert audit logs (using service role)
CREATE POLICY "Service can insert audit logs"
ON public.api_key_audit_log
FOR INSERT
WITH CHECK (true);

-- 1.3 Document plaintext message columns for E2E encryption migration
COMMENT ON COLUMN public.direct_messages.content IS 'Deprecated: plaintext storage during E2E encryption migration. Use encrypted_content instead.';
COMMENT ON COLUMN public.group_messages.content IS 'Deprecated: plaintext storage during E2E encryption migration. Use encrypted_content instead.';