-- Enhance developers table with branding
ALTER TABLE public.developers 
ADD COLUMN IF NOT EXISTS brand_primary_color text DEFAULT '#C9A961',
ADD COLUMN IF NOT EXISTS brand_accent_color text DEFAULT '#1A1F2C',
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS featured_project_id uuid;

-- Enhance developer_projects table with rich content fields
ALTER TABLE public.developer_projects 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS virtual_tour_url text,
ADD COLUMN IF NOT EXISTS brochure_url text,
ADD COLUMN IF NOT EXISTS starting_price numeric,
ADD COLUMN IF NOT EXISTS price_per_sqft_from numeric,
ADD COLUMN IF NOT EXISTS handover_date date,
ADD COLUMN IF NOT EXISTS launch_date date,
ADD COLUMN IF NOT EXISTS construction_progress_percent integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS master_plan_url text,
ADD COLUMN IF NOT EXISTS location_map_url text,
ADD COLUMN IF NOT EXISTS key_features jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS bedrooms_range text,
ADD COLUMN IF NOT EXISTS total_value numeric;

-- Create project_images table
CREATE TABLE IF NOT EXISTS public.project_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  category text NOT NULL DEFAULT 'exterior',
  is_primary boolean DEFAULT false,
  order_index integer DEFAULT 0,
  caption text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project_floor_plans table
CREATE TABLE IF NOT EXISTS public.project_floor_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text NOT NULL,
  bedrooms integer,
  size_sqft integer,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project_amenities table
CREATE TABLE IF NOT EXISTS public.project_amenities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'leisure',
  icon text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project_unit_types table
CREATE TABLE IF NOT EXISTS public.project_unit_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  bedrooms integer NOT NULL,
  bathrooms numeric,
  size_sqft_min integer,
  size_sqft_max integer,
  price_from numeric,
  price_to numeric,
  availability_status text DEFAULT 'available',
  floor_plan_url text,
  view_type text,
  floor_range text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create project_payment_plans table
CREATE TABLE IF NOT EXISTS public.project_payment_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  down_payment_percent integer DEFAULT 0,
  during_construction_percent integer DEFAULT 0,
  on_handover_percent integer DEFAULT 0,
  post_handover_percent integer DEFAULT 0,
  post_handover_months integer DEFAULT 0,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_saved_projects table for calendar integration
CREATE TABLE IF NOT EXISTS public.user_saved_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  notify_on_launch boolean DEFAULT true,
  notify_on_handover boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_unit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_images (public read, admin write)
CREATE POLICY "Anyone can view project images" ON public.project_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage project images" ON public.project_images FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for project_floor_plans (public read, admin write)
CREATE POLICY "Anyone can view project floor plans" ON public.project_floor_plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage project floor plans" ON public.project_floor_plans FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for project_amenities (public read, admin write)
CREATE POLICY "Anyone can view project amenities" ON public.project_amenities FOR SELECT USING (true);
CREATE POLICY "Admins can manage project amenities" ON public.project_amenities FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for project_unit_types (public read, admin write)
CREATE POLICY "Anyone can view project unit types" ON public.project_unit_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage project unit types" ON public.project_unit_types FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for project_payment_plans (public read, admin write)
CREATE POLICY "Anyone can view project payment plans" ON public.project_payment_plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage project payment plans" ON public.project_payment_plans FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_saved_projects (user-specific)
CREATE POLICY "Users can view their saved projects" ON public.user_saved_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save projects" ON public.user_saved_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their saved projects" ON public.user_saved_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their saved projects" ON public.user_saved_projects FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON public.project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_floor_plans_project_id ON public.project_floor_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_project_amenities_project_id ON public.project_amenities(project_id);
CREATE INDEX IF NOT EXISTS idx_project_unit_types_project_id ON public.project_unit_types(project_id);
CREATE INDEX IF NOT EXISTS idx_project_payment_plans_project_id ON public.project_payment_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_projects_user_id ON public.user_saved_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_developer_projects_slug ON public.developer_projects(slug);