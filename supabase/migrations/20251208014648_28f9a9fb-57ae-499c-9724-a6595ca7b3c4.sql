-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  level TEXT NOT NULL DEFAULT 'beginner',
  category TEXT NOT NULL DEFAULT 'Dubai Basics',
  thumbnail_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  content TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  is_free_preview BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, slug)
);

-- Create lesson_progress table
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Courses RLS: Everyone can view published courses
CREATE POLICY "Anyone can view published courses"
ON public.courses FOR SELECT
USING (is_published = true);

-- Admins can manage courses
CREATE POLICY "Admins can manage courses"
ON public.courses FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Lessons RLS: Everyone can view lessons of published courses
CREATE POLICY "Anyone can view lessons of published courses"
ON public.lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = lessons.course_id 
    AND courses.is_published = true
  )
);

-- Admins can manage lessons
CREATE POLICY "Admins can manage lessons"
ON public.lessons FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Lesson progress RLS: Users can manage their own progress
CREATE POLICY "Users can view their own progress"
ON public.lesson_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.lesson_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.lesson_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo courses
INSERT INTO public.courses (title, slug, description, level, category, thumbnail_url, duration_minutes, is_published, is_featured, order_index) VALUES
('Dubai Real Estate 101', 'dubai-real-estate-101', 'Master the fundamentals of Dubai real estate investing. Learn about freehold areas, ownership structures, and market dynamics.', 'beginner', 'Dubai Basics', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 120, true, true, 1),
('Off-Plan Investment Mastery', 'off-plan-investment-mastery', 'Discover how to identify, evaluate, and profit from off-plan property investments in Dubai.', 'intermediate', 'Off-Plan', 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800', 180, true, true, 2),
('Airbnb & Short-Term Rental Strategy', 'airbnb-short-term-rental', 'Learn how to maximize returns through short-term rentals and Airbnb in Dubai premium locations.', 'intermediate', 'Short-Term Rentals', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 150, true, false, 3),
('Golden Visa Pathways', 'golden-visa-pathways', 'Complete guide to obtaining UAE Golden Visa through real estate investment.', 'beginner', 'Golden Visa', 'https://images.unsplash.com/photo-1512632578888-169bbbd64f33?w=800', 90, true, true, 4),
('Building Your First Dubai Portfolio', 'building-first-portfolio', 'Strategic approach to building a diversified real estate portfolio in Dubai.', 'advanced', 'Portfolio Strategy', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', 240, true, false, 5),
('Dubai Marina Investment Deep Dive', 'dubai-marina-investment', 'Comprehensive analysis of Dubai Marina as an investment destination with ROI projections.', 'intermediate', 'Area Analysis', 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800', 100, true, false, 6),
('Developer Analysis & Due Diligence', 'developer-analysis', 'Learn how to evaluate Dubai developers, their track records, and project quality.', 'advanced', 'Due Diligence', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800', 130, true, false, 7);

-- Insert demo lessons for Dubai Real Estate 101
INSERT INTO public.lessons (course_id, title, slug, description, content, order_index, duration_minutes, is_free_preview) VALUES
((SELECT id FROM public.courses WHERE slug = 'dubai-real-estate-101'), 'Welcome to Dubai Real Estate', 'welcome', 'Introduction to the course and what you will learn.', '## Welcome to Dubai Real Estate 101

In this comprehensive course, you will learn everything you need to know about investing in Dubai real estate.

### What You Will Learn
- Understanding the Dubai property market
- Freehold vs leasehold areas
- Legal requirements for foreign investors
- Working with agents and developers

### Course Structure
This course is divided into 6 lessons, each building on the previous one to give you a complete understanding of the Dubai real estate market.', 1, 15, true),
((SELECT id FROM public.courses WHERE slug = 'dubai-real-estate-101'), 'Understanding Freehold Areas', 'freehold-areas', 'Learn about freehold zones where foreigners can own property.', '## Freehold Areas in Dubai

Dubai has designated specific areas where foreign nationals can purchase property on a freehold basis.

### Key Freehold Areas
1. **Dubai Marina** - Premium waterfront living
2. **Downtown Dubai** - Home to Burj Khalifa
3. **Palm Jumeirah** - Iconic island development
4. **JVC (Jumeirah Village Circle)** - Affordable family living
5. **Business Bay** - Commercial and residential hub

### Benefits of Freehold Ownership
- Full ownership rights
- Can be inherited
- No time restrictions
- Rental income potential', 2, 20, false),
((SELECT id FROM public.courses WHERE slug = 'dubai-real-estate-101'), 'Legal Framework for Foreign Investors', 'legal-framework', 'Understanding the legal requirements and process.', '## Legal Framework

### Ownership Rights
Foreign investors enjoy the same property rights as UAE nationals in designated freehold areas.

### Required Documents
- Valid passport
- Visa (not required for purchase)
- No Objection Certificate (for certain nationalities)

### The Purchase Process
1. Property selection
2. Memorandum of Understanding (MOU)
3. Due diligence
4. Sales and Purchase Agreement (SPA)
5. Transfer of ownership at DLD', 3, 25, false),
((SELECT id FROM public.courses WHERE slug = 'dubai-real-estate-101'), 'Working with Agents & Developers', 'agents-developers', 'How to choose and work with real estate professionals.', '## Working with Professionals

### RERA Registration
All agents in Dubai must be registered with RERA (Real Estate Regulatory Authority).

### Choosing an Agent
- Check RERA registration
- Look for experience in your target area
- Ask for references
- Understand commission structures

### Developer Due Diligence
- Check RERA project registration
- Review developer track record
- Visit completed projects
- Understand payment plans', 4, 20, false),
((SELECT id FROM public.courses WHERE slug = 'dubai-real-estate-101'), 'Understanding Market Cycles', 'market-cycles', 'Learn to identify and capitalize on market trends.', '## Dubai Market Cycles

### Historical Performance
Dubai real estate has shown strong growth patterns with periodic corrections.

### Key Indicators
- Transaction volumes
- Price per square foot trends
- Rental yields
- Supply pipeline

### Best Times to Invest
- During market corrections
- Early in new development launches
- When yields are above average', 5, 20, false),
((SELECT id FROM public.courses WHERE slug = 'dubai-real-estate-101'), 'Your First Investment Strategy', 'first-investment', 'Creating your personalized investment plan.', '## Your Investment Strategy

### Define Your Goals
- Capital appreciation
- Rental income
- Golden Visa qualification
- Portfolio diversification

### Budget Planning
- Down payment requirements
- Mortgage options
- Associated costs (DLD, agent fees)

### Action Steps
1. Set clear investment goals
2. Define your budget
3. Research target areas
4. Connect with RERA-registered agents
5. Start property viewings', 6, 20, false);

-- Insert lessons for Off-Plan Investment Mastery
INSERT INTO public.lessons (course_id, title, slug, description, content, order_index, duration_minutes, is_free_preview) VALUES
((SELECT id FROM public.courses WHERE slug = 'off-plan-investment-mastery'), 'Introduction to Off-Plan', 'intro-off-plan', 'Understanding off-plan investments and their benefits.', '## What is Off-Plan Investment?

Off-plan properties are purchased before or during construction, typically at below market rates.

### Key Benefits
- Lower entry prices (10-30% below ready)
- Attractive payment plans
- Capital appreciation during construction
- First pick of best units

### Risks to Consider
- Construction delays
- Developer reliability
- Market fluctuations', 1, 20, true),
((SELECT id FROM public.courses WHERE slug = 'off-plan-investment-mastery'), 'Evaluating Developers', 'evaluating-developers', 'How to assess developer credibility and track record.', '## Developer Evaluation

### Top-Tier Developers
- Emaar Properties
- DAMAC Properties
- Nakheel
- Dubai Properties
- Meraas

### Evaluation Criteria
1. Completed projects
2. Delivery track record
3. Build quality
4. After-sales service
5. Financial stability', 2, 25, false),
((SELECT id FROM public.courses WHERE slug = 'off-plan-investment-mastery'), 'Payment Plans Decoded', 'payment-plans', 'Understanding different payment structures.', '## Payment Plan Structures

### Common Structures
- **Construction-linked**: Pay as building progresses
- **Post-handover**: 30-50% after completion
- **Easy payment**: Extended payment terms

### Analyzing Value
Calculate the true cost including:
- Service charges
- DLD fees
- Agent commission
- Mortgage costs', 3, 30, false),
((SELECT id FROM public.courses WHERE slug = 'off-plan-investment-mastery'), 'Location Analysis', 'location-analysis', 'Choosing the right location for maximum returns.', '## Location Strategy

### High-Growth Areas
- Dubai Creek Harbour
- Dubai Hills Estate
- MBR City
- Expo City

### Factors to Consider
- Infrastructure development
- Proximity to metro
- Developer reputation in area
- Future supply pipeline', 4, 25, false),
((SELECT id FROM public.courses WHERE slug = 'off-plan-investment-mastery'), 'Exit Strategies', 'exit-strategies', 'When and how to sell for maximum profit.', '## Exit Strategy Planning

### Timing Your Exit
- Assignment during construction
- Immediate post-handover
- After rental stabilization

### Maximizing Returns
- Stage your property
- Time the market
- Work with experienced agents
- Consider renovation if needed', 5, 25, false);

-- Insert lessons for Golden Visa course
INSERT INTO public.lessons (course_id, title, slug, description, content, order_index, duration_minutes, is_free_preview) VALUES
((SELECT id FROM public.courses WHERE slug = 'golden-visa-pathways'), 'Golden Visa Overview', 'overview', 'Understanding the UAE Golden Visa program.', '## UAE Golden Visa

The UAE Golden Visa is a long-term residence visa (5-10 years) available to investors, entrepreneurs, and talented individuals.

### Key Benefits
- Long-term residency
- Sponsor family members
- No sponsor required
- 100% business ownership
- Easy entry and exit

### Visa Duration
- 10-year visa for property investment of AED 2M+
- Auto-renewable', 1, 15, true),
((SELECT id FROM public.courses WHERE slug = 'golden-visa-pathways'), 'Property Investment Requirements', 'property-requirements', 'Minimum investment and property criteria.', '## Investment Requirements

### Minimum Investment
- AED 2,000,000 in property
- Can be single or multiple properties
- Must be freehold

### Eligible Properties
- Completed (ready) properties
- Off-plan with 50%+ paid
- Property must be retained', 2, 20, false),
((SELECT id FROM public.courses WHERE slug = 'golden-visa-pathways'), 'Application Process', 'application-process', 'Step-by-step guide to applying.', '## Application Steps

1. Purchase qualifying property
2. Obtain title deed
3. Get property valuation
4. Apply through ICP portal
5. Medical fitness test
6. Emirates ID application
7. Visa stamping

### Timeline
Typically 2-4 weeks after property registration', 3, 25, false),
((SELECT id FROM public.courses WHERE slug = 'golden-visa-pathways'), 'Family Sponsorship', 'family-sponsorship', 'Sponsoring spouse, children, and dependents.', '## Family Benefits

### Who Can Be Sponsored
- Spouse
- Children (any age)
- Parents

### Requirements
- Valid Golden Visa
- Proof of relationship
- Medical insurance
- Individual applications required', 4, 15, false),
((SELECT id FROM public.courses WHERE slug = 'golden-visa-pathways'), 'Maintaining Your Status', 'maintaining-status', 'Keeping your Golden Visa active.', '## Maintaining Golden Visa

### Key Requirements
- Property ownership must continue
- Entry to UAE at least once every 6 months
- Valid for full 10 years

### Renewal Process
- Automatic if requirements met
- Re-apply 30 days before expiry', 5, 15, false);