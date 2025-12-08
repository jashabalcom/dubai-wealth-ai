-- Create admin metrics snapshots table for historical KPI tracking
CREATE TABLE public.admin_metrics_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL UNIQUE,
  mrr NUMERIC DEFAULT 0,
  arr NUMERIC DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  investor_count INTEGER DEFAULT 0,
  elite_count INTEGER DEFAULT 0,
  free_count INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  new_signups_today INTEGER DEFAULT 0,
  churn_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create marketing campaigns table for ROAS tracking
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'google', 'tiktok', 'linkedin', 'other')),
  campaign_id TEXT,
  campaign_name TEXT NOT NULL,
  ad_spend NUMERIC DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_attributed NUMERIC DEFAULT 0,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admin activity log for dashboard feed
CREATE TABLE public.admin_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies - admin only access
CREATE POLICY "Admins can manage metrics snapshots"
  ON public.admin_metrics_snapshots
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage marketing campaigns"
  ON public.marketing_campaigns
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view activity log"
  ON public.admin_activity_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert activity log"
  ON public.admin_activity_log
  FOR INSERT
  WITH CHECK (true);

-- Create trigger for updated_at on marketing_campaigns
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_admin_metrics_snapshot_date ON public.admin_metrics_snapshots(snapshot_date DESC);
CREATE INDEX idx_marketing_campaigns_date ON public.marketing_campaigns(date DESC);
CREATE INDEX idx_marketing_campaigns_platform ON public.marketing_campaigns(platform);
CREATE INDEX idx_admin_activity_log_created ON public.admin_activity_log(created_at DESC);