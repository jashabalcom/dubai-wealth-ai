-- Create message_reactions table
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view reactions on messages they can see
CREATE POLICY "Users can view reactions on their messages"
ON public.message_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.direct_messages dm
    WHERE dm.id = message_reactions.message_id
    AND (dm.sender_id = auth.uid() OR dm.recipient_id = auth.uid())
  )
);

-- Users can add reactions to messages they can see
CREATE POLICY "Users can add reactions"
ON public.message_reactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.direct_messages dm
    WHERE dm.id = message_reactions.message_id
    AND (dm.sender_id = auth.uid() OR dm.recipient_id = auth.uid())
  )
);

-- Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions"
ON public.message_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);