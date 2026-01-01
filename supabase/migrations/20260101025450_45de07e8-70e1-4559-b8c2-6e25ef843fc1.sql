-- Create team workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  max_members INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID,
  UNIQUE(workspace_id, user_id)
);

-- Create API keys table for enterprise access
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read']::TEXT[],
  rate_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API usage logs table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create white-label configurations table
CREATE TABLE IF NOT EXISTS public.white_label_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
  custom_domain TEXT,
  primary_color TEXT DEFAULT '#D4AF37',
  secondary_color TEXT DEFAULT '#1a1a1a',
  logo_url TEXT,
  favicon_url TEXT,
  company_name TEXT,
  custom_css TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_configs ENABLE ROW LEVEL SECURITY;

-- Workspaces policies
CREATE POLICY "Users can view workspaces they belong to" ON public.workspaces
  FOR SELECT USING (
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Workspace owners can update their workspace" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Workspace members policies
CREATE POLICY "Members can view workspace members" ON public.workspace_members
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage workspace members" ON public.workspace_members
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- API keys policies
CREATE POLICY "Users can view their own API keys" ON public.api_keys
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own API keys" ON public.api_keys
  FOR ALL USING (user_id = auth.uid());

-- API usage logs policies
CREATE POLICY "Users can view logs for their API keys" ON public.api_usage_logs
  FOR SELECT USING (
    api_key_id IN (SELECT id FROM public.api_keys WHERE user_id = auth.uid())
  );

-- White label configs policies
CREATE POLICY "Workspace admins can view white label config" ON public.white_label_configs
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners can manage white label config" ON public.white_label_configs
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Create indexes
CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_workspace ON public.api_keys(workspace_id);
CREATE INDEX idx_api_usage_logs_key ON public.api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_created ON public.api_usage_logs(created_at);

-- Add triggers for updated_at
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_white_label_configs_updated_at
  BEFORE UPDATE ON public.white_label_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();