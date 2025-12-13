
-- Track tool usage for free users (3 free uses per tool)
CREATE TABLE public.tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tool_name TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track AI assistant usage for free users (5 free queries)
CREATE TABLE public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  query_type TEXT NOT NULL DEFAULT 'chat',
  used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for tool_usage
CREATE POLICY "Users can view their own tool usage"
ON public.tool_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool usage"
ON public.tool_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS policies for ai_usage
CREATE POLICY "Users can view their own AI usage"
ON public.ai_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage"
ON public.ai_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_tool_usage_user_tool ON public.tool_usage(user_id, tool_name);
CREATE INDEX idx_ai_usage_user ON public.ai_usage(user_id);
