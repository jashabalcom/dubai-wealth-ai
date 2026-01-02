-- Create sync progress tracking table
CREATE TABLE public.sync_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL DEFAULT 'bayut_properties',
  status text NOT NULL DEFAULT 'idle', -- idle, running, paused, completed
  current_area_index integer DEFAULT 0,
  current_page integer DEFAULT 1,
  current_listing_type text DEFAULT 'for-sale',
  areas_config jsonb DEFAULT '[]'::jsonb,
  total_areas integer DEFAULT 0,
  total_pages_per_area integer DEFAULT 20,
  properties_synced integer DEFAULT 0,
  photos_synced integer DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  started_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sync_progress ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage sync progress
CREATE POLICY "Admins can manage sync progress"
ON public.sync_progress
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create index for quick lookups
CREATE INDEX idx_sync_progress_status ON public.sync_progress(status);
CREATE INDEX idx_sync_progress_type ON public.sync_progress(sync_type);