-- Create news_articles table for hybrid news feed
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  article_type TEXT NOT NULL DEFAULT 'headline' CHECK (article_type IN ('headline', 'featured')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_hash TEXT UNIQUE,
  image_url TEXT,
  category TEXT DEFAULT 'market_trends' CHECK (category IN ('market_trends', 'developer_news', 'golden_visa', 'off_plan', 'regulations', 'lifestyle')),
  reading_time_minutes INTEGER DEFAULT 2,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Members can view published articles (members-only content)
CREATE POLICY "Members can view published news" 
ON public.news_articles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND status = 'published');

-- Admins can manage all articles
CREATE POLICY "Admins can manage news articles" 
ON public.news_articles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_news_articles_status ON public.news_articles(status);
CREATE INDEX idx_news_articles_category ON public.news_articles(category);
CREATE INDEX idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX idx_news_articles_article_type ON public.news_articles(article_type);

-- Trigger for updated_at
CREATE TRIGGER update_news_articles_updated_at
BEFORE UPDATE ON public.news_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();