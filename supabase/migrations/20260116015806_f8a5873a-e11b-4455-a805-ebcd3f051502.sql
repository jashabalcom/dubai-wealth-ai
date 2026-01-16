-- Create support_messages table for real-time chat
CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add admin_id to support_tickets for claiming tickets
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS admin_id UUID,
ADD COLUMN IF NOT EXISTS admin_joined_at TIMESTAMPTZ;

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages from their own tickets
CREATE POLICY "Users can read own ticket messages"
ON public.support_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE id = ticket_id AND user_id = auth.uid()
  )
);

-- Users can insert messages to their own tickets
CREATE POLICY "Users can insert messages to own tickets"
ON public.support_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  sender_type = 'user' AND
  EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE id = ticket_id AND user_id = auth.uid()
  )
);

-- Admins can read all messages
CREATE POLICY "Admins can read all messages"
ON public.support_messages
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Admins can insert messages
CREATE POLICY "Admins can insert messages"
ON public.support_messages
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin') AND
  sender_type = 'admin'
);

-- Update support_tickets policies for admin access
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tickets"
ON public.support_tickets
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for support_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- Create index for faster queries
CREATE INDEX idx_support_messages_ticket_id ON public.support_messages(ticket_id);
CREATE INDEX idx_support_messages_created_at ON public.support_messages(created_at);