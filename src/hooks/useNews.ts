import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type NewsCategory = 'all' | 'market_trends' | 'developer_news' | 'golden_visa' | 'off_plan' | 'regulations' | 'lifestyle';

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  article_type: 'headline' | 'featured';
  status: string;
  source_name: string;
  source_url: string;
  image_url: string | null;
  category: NewsCategory;
  reading_time_minutes: number | null;
  published_at: string | null;
  created_at: string;
}

export function useNews(category: NewsCategory = 'all') {
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (!user) {
      setArticles([]);
      setFeaturedArticle(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch featured article (latest published featured)
      const { data: featured, error: featuredError } = await supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'published')
        .eq('article_type', 'featured')
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      if (featured && !featuredError) {
        setFeaturedArticle(featured as NewsArticle);
      }

      // Fetch headlines
      let query = supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50);

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error: articlesError } = await query;

      if (articlesError) throw articlesError;

      setArticles((data || []) as NewsArticle[]);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setIsLoading(false);
    }
  }, [user, category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    articles,
    featuredArticle,
    isLoading,
    error,
    refetch: fetchNews,
  };
}

export function useNewsAdmin() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [drafts, setDrafts] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all articles for admin
      const { data: allArticles } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      const all = (allArticles || []) as NewsArticle[];
      setArticles(all.filter(a => a.status === 'published'));
      setDrafts(all.filter(a => a.status === 'draft'));
    } catch (err) {
      console.error('Error fetching admin news:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const syncRSS = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-news-rss');
      if (error) throw error;
      await fetchAll();
      return data;
    } finally {
      setIsSyncing(false);
    }
  };

  const generateFeatured = async (sourceUrl: string, articleId?: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-featured-article', {
        body: { source_url: sourceUrl, article_id: articleId },
      });
      if (error) throw error;
      await fetchAll();
      return data;
    } finally {
      setIsGenerating(false);
    }
  };

  const publishArticle = async (id: string) => {
    const { error } = await supabase
      .from('news_articles')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
    await fetchAll();
  };

  const archiveArticle = async (id: string) => {
    const { error } = await supabase
      .from('news_articles')
      .update({ status: 'archived' })
      .eq('id', id);
    
    if (error) throw error;
    await fetchAll();
  };

  const deleteArticle = async (id: string) => {
    const { error } = await supabase
      .from('news_articles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await fetchAll();
  };

  return {
    articles,
    drafts,
    isLoading,
    isSyncing,
    isGenerating,
    syncRSS,
    generateFeatured,
    publishArticle,
    archiveArticle,
    deleteArticle,
    refetch: fetchAll,
  };
}