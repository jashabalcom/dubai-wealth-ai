-- Create SECURITY DEFINER function to check group membership (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_group_member(group_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_chat_members
    WHERE group_id = group_uuid
      AND user_id = auth.uid()
  )
$$;

-- Drop and recreate group_chat_members SELECT policy to use the new function
DROP POLICY IF EXISTS "Members can view group members" ON public.group_chat_members;

CREATE POLICY "Members can view group members"
ON public.group_chat_members
FOR SELECT
USING (public.is_group_member(group_id));

-- Update group_messages SELECT policy to use the new function  
DROP POLICY IF EXISTS "Members can view group messages" ON public.group_messages;

CREATE POLICY "Members can view group messages"
ON public.group_messages
FOR SELECT
USING (public.is_group_member(group_id));

-- Update group_messages INSERT policy to use the new function
DROP POLICY IF EXISTS "Members can send group messages" ON public.group_messages;

CREATE POLICY "Members can send group messages"
ON public.group_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND public.is_group_member(group_id)
);