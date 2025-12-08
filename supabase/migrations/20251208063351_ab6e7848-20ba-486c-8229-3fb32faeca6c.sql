-- Create group_chats table
CREATE TABLE public.group_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_chat_members table
CREATE TABLE public.group_chat_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group_messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- Group chats policies (members can view)
CREATE POLICY "Members can view their groups"
ON public.group_chats FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.group_chat_members
  WHERE group_chat_members.group_id = group_chats.id
  AND group_chat_members.user_id = auth.uid()
));

CREATE POLICY "Users can create groups"
ON public.group_chats FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their groups"
ON public.group_chats FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their groups"
ON public.group_chats FOR DELETE
USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Members can view group members"
ON public.group_chat_members FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.group_chat_members gcm
  WHERE gcm.group_id = group_chat_members.group_id
  AND gcm.user_id = auth.uid()
));

CREATE POLICY "Group creators can add members"
ON public.group_chat_members FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.group_chats
  WHERE group_chats.id = group_chat_members.group_id
  AND group_chats.created_by = auth.uid()
) OR (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.group_chats
  WHERE group_chats.id = group_chat_members.group_id
  AND group_chats.created_by = auth.uid()
)));

CREATE POLICY "Creators can remove members"
ON public.group_chat_members FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.group_chats
  WHERE group_chats.id = group_chat_members.group_id
  AND group_chats.created_by = auth.uid()
) OR auth.uid() = user_id);

-- Group messages policies
CREATE POLICY "Members can view group messages"
ON public.group_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.group_chat_members
  WHERE group_chat_members.group_id = group_messages.group_id
  AND group_chat_members.user_id = auth.uid()
));

CREATE POLICY "Members can send group messages"
ON public.group_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id AND EXISTS (
  SELECT 1 FROM public.group_chat_members
  WHERE group_chat_members.group_id = group_messages.group_id
  AND group_chat_members.user_id = auth.uid()
));

CREATE POLICY "Senders can delete their messages"
ON public.group_messages FOR DELETE
USING (auth.uid() = sender_id);

-- Enable realtime for group messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;

-- Add updated_at trigger
CREATE TRIGGER update_group_chats_updated_at
BEFORE UPDATE ON public.group_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();