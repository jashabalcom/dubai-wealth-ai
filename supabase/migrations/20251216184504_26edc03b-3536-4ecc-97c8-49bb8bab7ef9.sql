-- Add is_live column to community_events table
ALTER TABLE public.community_events 
ADD COLUMN is_live boolean NOT NULL DEFAULT false;

-- Enable realtime for community_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_events;