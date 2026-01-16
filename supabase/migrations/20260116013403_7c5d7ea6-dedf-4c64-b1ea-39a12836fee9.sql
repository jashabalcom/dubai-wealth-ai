-- Create support_tickets table for AI support system
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Conversation data
  conversation_history jsonb NOT NULL DEFAULT '[]',
  initial_message text NOT NULL,
  
  -- Classification
  status text NOT NULL DEFAULT 'ai_handling',
  category text,
  priority text DEFAULT 'normal',
  
  -- AI handling info
  ai_resolution_attempted boolean DEFAULT true,
  ai_confidence_score numeric(3,2),
  escalation_reason text,
  
  -- Assignment
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Metadata
  page_url text,
  user_agent text,
  session_context jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  last_message_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('ai_handling', 'escalated', 'human_handling', 'resolved', 'closed')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  CONSTRAINT valid_category CHECK (category IN ('general', 'property', 'visa', 'billing', 'technical', 'account', 'other'))
);

-- Indexes for performance
CREATE INDEX idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_created ON public.support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_escalated ON public.support_tickets(status) WHERE status = 'escalated';

-- Enable Row Level Security
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create tickets  
CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own active tickets
CREATE POLICY "Users can update own tickets" ON public.support_tickets
  FOR UPDATE USING (auth.uid() = user_id AND status IN ('ai_handling', 'escalated'));

-- Admins can do everything
CREATE POLICY "Admins full access" ON public.support_tickets
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;