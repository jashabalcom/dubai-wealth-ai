-- Add embedded meeting fields to community_events
ALTER TABLE public.community_events 
ADD COLUMN IF NOT EXISTS use_embedded_meeting boolean DEFAULT false;

ALTER TABLE public.community_events 
ADD COLUMN IF NOT EXISTS jitsi_room_name text;