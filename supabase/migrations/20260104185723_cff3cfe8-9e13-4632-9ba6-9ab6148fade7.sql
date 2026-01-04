-- Security events log table for monitoring dashboard
CREATE TABLE public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'rate_limit_hit', 'failed_auth', 'suspicious_activity', 'reauth_success', 'reauth_failure', 'sensitive_action'
    severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warn', 'error', 'critical'
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    endpoint TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can read security events
CREATE POLICY "Admins can read security events"
ON public.security_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Service role can insert (edge functions)
CREATE POLICY "Service can insert security events"
ON public.security_events
FOR INSERT
TO service_role
WITH CHECK (true);

-- Index for efficient queries
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);

-- Function to log security events (callable from edge functions)
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type TEXT,
    p_severity TEXT DEFAULT 'info',
    p_user_id UUID DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_endpoint TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO public.security_events (
        event_type, severity, user_id, ip_address, user_agent, endpoint, details
    ) VALUES (
        p_event_type, p_severity, p_user_id, p_ip_address, p_user_agent, p_endpoint, p_details
    )
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$;