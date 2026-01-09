-- Create sync_schedules table for automated sync configuration
CREATE TABLE public.sync_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_name TEXT NOT NULL UNIQUE,
  schedule_type TEXT NOT NULL DEFAULT 'daily',
  is_enabled BOOLEAN DEFAULT true,
  cron_expression TEXT NOT NULL,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_run_status TEXT,
  last_run_properties_synced INTEGER DEFAULT 0,
  last_run_duration_seconds INTEGER,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sync_schedules ENABLE ROW LEVEL SECURITY;

-- Admin-only policy (using user_roles)
CREATE POLICY "Admins can manage sync schedules"
ON public.sync_schedules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role has full access to sync_schedules"
ON public.sync_schedules
FOR ALL
USING (auth.role() = 'service_role');

-- Insert default Bayut daily sync schedule (3 AM Dubai = 23:00 UTC)
INSERT INTO sync_schedules (schedule_name, schedule_type, cron_expression, config) VALUES (
  'bayut_daily_sync',
  'daily',
  '0 23 * * *',
  '{
    "areas": "all",
    "pages_per_area": 5,
    "lite_mode": false,
    "include_rentals": true,
    "skip_recently_synced": false
  }'::jsonb
);

-- Create updated_at trigger
CREATE TRIGGER update_sync_schedules_updated_at
BEFORE UPDATE ON public.sync_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();