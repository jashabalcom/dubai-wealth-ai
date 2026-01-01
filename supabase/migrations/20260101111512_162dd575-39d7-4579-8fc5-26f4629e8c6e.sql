-- Add Zoom-specific columns to community_events table
ALTER TABLE public.community_events
ADD COLUMN IF NOT EXISTS zoom_meeting_number text,
ADD COLUMN IF NOT EXISTS zoom_password text,
ADD COLUMN IF NOT EXISTS zoom_host_key text;