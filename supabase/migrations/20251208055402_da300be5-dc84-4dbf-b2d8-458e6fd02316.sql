-- Create direct_messages table
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Create a function to check if two users are connected
CREATE OR REPLACE FUNCTION public.are_connected(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.connections
    WHERE status = 'accepted'
      AND (
        (requester_id = user_a AND recipient_id = user_b)
        OR (requester_id = user_b AND recipient_id = user_a)
      )
  )
$$;

-- Policy: Users can send messages only to connected members
CREATE POLICY "Users can send messages to connections"
ON public.direct_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND sender_id != recipient_id
  AND public.are_connected(sender_id, recipient_id)
);

-- Policy: Users can view messages where they are sender or recipient
CREATE POLICY "Users can view their own messages"
ON public.direct_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Policy: Recipients can mark messages as read
CREATE POLICY "Recipients can mark messages as read"
ON public.direct_messages
FOR UPDATE
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- Policy: Senders can delete their own messages
CREATE POLICY "Senders can delete their messages"
ON public.direct_messages
FOR DELETE
USING (auth.uid() = sender_id);

-- Create indexes for performance
CREATE INDEX idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX idx_direct_messages_recipient ON public.direct_messages(recipient_id);
CREATE INDEX idx_direct_messages_created ON public.direct_messages(created_at DESC);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;