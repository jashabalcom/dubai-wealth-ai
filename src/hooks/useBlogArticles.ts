import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { NewsArticle, NewsCategory } from './useNews';

export function useBlogArticles(category: NewsCategory = 'all') {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
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

      // Fetch all published articles
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
      console.error('Error fetching blog articles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    featuredArticle,
    isLoading,
    error,
    refetch: fetchArticles,
  };
}

export function useBlogArticle(slug: string) {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      setIsLoading(true);
      setError(null);

      try {
        // Extract ID from slug (last 8 chars after last dash)
        const idMatch = slug.match(/-([a-f0-9]{8})$/);
        const articleId = idMatch ? idMatch[1] : null;

        if (!articleId) {
          throw new Error('Invalid article URL');
        }

        // Fetch article by ID prefix
        const { data, error: articleError } = await supabase
          .from('news_articles')
          .select('*')
          .like('id', `${articleId}%`)
          .eq('status', 'published')
          .single();

        if (articleError || !data) {
          throw new Error('Article not found');
        }

        setArticle(data as NewsArticle);

        // Fetch related articles from same category
        const { data: related } = await supabase
          .from('news_articles')
          .select('*')
          .eq('status', 'published')
          .eq('category', data.category)
          .neq('id', data.id)
          .order('published_at', { ascending: false })
          .limit(3);

        setRelatedArticles((related || []) as NewsArticle[]);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  return {
    article,
    relatedArticles,
    isLoading,
    error,
  };
}
