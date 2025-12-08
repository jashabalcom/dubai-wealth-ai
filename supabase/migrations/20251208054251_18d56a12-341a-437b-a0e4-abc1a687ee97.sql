-- Create connections table for connection requests
CREATE TABLE public.connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Users can view connections they're involved in
CREATE POLICY "Users can view their own connections"
ON public.connections FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Users can create connection requests
CREATE POLICY "Users can send connection requests"
ON public.connections FOR INSERT
WITH CHECK (auth.uid() = requester_id AND requester_id != recipient_id);

-- Users can update connections they received (accept/reject)
CREATE POLICY "Recipients can respond to connection requests"
ON public.connections FOR UPDATE
USING (auth.uid() = recipient_id);

-- Users can delete their own requests or connections
CREATE POLICY "Users can delete their connections"
ON public.connections FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Add trigger for updated_at
CREATE TRIGGER update_connections_updated_at
BEFORE UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();