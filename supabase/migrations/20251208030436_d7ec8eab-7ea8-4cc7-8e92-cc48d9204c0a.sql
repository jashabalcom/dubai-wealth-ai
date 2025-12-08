-- Create community_events table
CREATE TABLE public.community_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  event_type TEXT NOT NULL DEFAULT 'webinar',
  meeting_platform TEXT NOT NULL DEFAULT 'zoom',
  meeting_url TEXT,
  meeting_id TEXT,
  cover_image_url TEXT,
  visibility channel_visibility NOT NULL DEFAULT 'all_members',
  max_attendees INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'registered',
  UNIQUE (event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_events
CREATE POLICY "Members can view published events based on visibility"
ON public.community_events
FOR SELECT
USING (
  is_published = true AND (
    visibility = 'all_members'::channel_visibility OR
    (visibility = 'elite_only'::channel_visibility AND EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.membership_tier = 'elite'::membership_tier
    ))
  )
);

CREATE POLICY "Admins can manage all events"
ON public.community_events
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for event_registrations
CREATE POLICY "Users can view registrations for accessible events"
ON public.event_registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM community_events e
    WHERE e.id = event_registrations.event_id
    AND e.is_published = true
    AND (
      e.visibility = 'all_members'::channel_visibility OR
      (e.visibility = 'elite_only'::channel_visibility AND EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.membership_tier = 'elite'::membership_tier
      ))
    )
  )
);

CREATE POLICY "Users can register for accessible events"
ON public.event_registrations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM community_events e
    WHERE e.id = event_registrations.event_id
    AND e.is_published = true
    AND (
      e.visibility = 'all_members'::channel_visibility OR
      (e.visibility = 'elite_only'::channel_visibility AND EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.membership_tier = 'elite'::membership_tier
      ))
    )
  )
);

CREATE POLICY "Users can update their own registrations"
ON public.event_registrations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own registrations"
ON public.event_registrations
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all registrations"
ON public.event_registrations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_community_events_updated_at
BEFORE UPDATE ON public.community_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();