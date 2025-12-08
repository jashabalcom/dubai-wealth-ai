-- Create saved_properties table for user favorites
CREATE TABLE public.saved_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- Enable RLS
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

-- Users can view their saved properties
CREATE POLICY "Users can view their saved properties"
ON public.saved_properties
FOR SELECT
USING (auth.uid() = user_id);

-- Users can save properties
CREATE POLICY "Users can save properties"
ON public.saved_properties
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unsave properties
CREATE POLICY "Users can unsave properties"
ON public.saved_properties
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_saved_properties_user_id ON public.saved_properties(user_id);
CREATE INDEX idx_saved_properties_property_id ON public.saved_properties(property_id);