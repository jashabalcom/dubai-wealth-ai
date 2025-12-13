
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Add notification preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notify_email_messages BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_email_connections BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_email_comments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_email_events BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_inapp_messages BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_inapp_connections BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_inapp_comments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_inapp_events BOOLEAN DEFAULT true;
