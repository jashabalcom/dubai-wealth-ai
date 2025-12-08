-- Create ai_strategies table for Elite members to save their strategies
CREATE TABLE public.ai_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  ai_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_strategies ENABLE ROW LEVEL SECURITY;

-- Users can only view their own strategies
CREATE POLICY "Users can view their own strategies"
ON public.ai_strategies
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own strategies
CREATE POLICY "Users can create their own strategies"
ON public.ai_strategies
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own strategies
CREATE POLICY "Users can update their own strategies"
ON public.ai_strategies
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own strategies
CREATE POLICY "Users can delete their own strategies"
ON public.ai_strategies
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_ai_strategies_user_id ON public.ai_strategies(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_strategies_updated_at
BEFORE UPDATE ON public.ai_strategies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();