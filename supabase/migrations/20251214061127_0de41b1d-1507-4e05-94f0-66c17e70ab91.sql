-- Extend developers table with new columns
ALTER TABLE developers ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'standard';
ALTER TABLE developers ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS total_units_delivered INTEGER DEFAULT 0;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS awards JSONB DEFAULT '[]';
ALTER TABLE developers ADD COLUMN IF NOT EXISTS key_partnerships JSONB DEFAULT '[]';
ALTER TABLE developers ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Create developer_projects table
CREATE TABLE public.developer_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES developers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  location_area TEXT,
  project_type TEXT DEFAULT 'residential',
  status TEXT DEFAULT 'completed',
  completion_year INTEGER,
  total_units INTEGER,
  image_url TEXT,
  description TEXT,
  highlights JSONB DEFAULT '[]',
  is_flagship BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(developer_id, slug)
);

-- Create indexes for performance
CREATE INDEX idx_developer_projects_developer_id ON developer_projects(developer_id);
CREATE INDEX idx_developer_projects_status ON developer_projects(status);
CREATE INDEX idx_developers_tier ON developers(tier);

-- Enable RLS
ALTER TABLE developer_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can view, admins can manage
CREATE POLICY "Anyone can view developer projects"
ON developer_projects FOR SELECT
USING (true);

CREATE POLICY "Admins can manage developer projects"
ON developer_projects FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_developer_projects_updated_at
BEFORE UPDATE ON developer_projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();