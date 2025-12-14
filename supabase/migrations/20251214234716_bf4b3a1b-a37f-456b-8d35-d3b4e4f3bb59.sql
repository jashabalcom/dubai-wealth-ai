-- Add recording support columns to community_events table
ALTER TABLE public.community_events
ADD COLUMN recording_url text,
ADD COLUMN recording_visible boolean NOT NULL DEFAULT false,
ADD COLUMN recording_access text NOT NULL DEFAULT 'all_members';

-- Add comment for clarity
COMMENT ON COLUMN public.community_events.recording_url IS 'URL to the event recording (YouTube, Vimeo, direct video)';
COMMENT ON COLUMN public.community_events.recording_visible IS 'Whether the recording is visible to eligible users';
COMMENT ON COLUMN public.community_events.recording_access IS 'Access tier for recording: all_members (Investor+), elite_only';