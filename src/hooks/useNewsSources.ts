import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  feed_type: 'rss' | 'scrape' | 'api';
  keywords: string[];
  tier: number;
  is_active: boolean;
  last_synced_at: string | null;
  articles_synced: number;
  error_count: number;
  last_error: string | null;
  sync_frequency: string;
  created_at: string;
  updated_at: string;
}

export function useNewsSources() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sources, isLoading, error } = useQuery({
    queryKey: ['news-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_sources')
        .select('*')
        .order('tier', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as NewsSource[];
    },
  });

  const toggleSource = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('news_sources')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-sources'] });
      toast({
        title: 'Source updated',
        description: 'News source status has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addSource = useMutation({
    mutationFn: async (source: { 
      name: string; 
      url: string; 
      feed_type?: string; 
      tier?: number; 
      keywords?: string[]; 
      sync_frequency?: string 
    }) => {
      const { error } = await supabase
        .from('news_sources')
        .insert([source]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-sources'] });
      toast({
        title: 'Source added',
        description: 'New news source has been added.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateSource = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewsSource> & { id: string }) => {
      const { error } = await supabase
        .from('news_sources')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-sources'] });
      toast({
        title: 'Source updated',
        description: 'News source has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteSource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-sources'] });
      toast({
        title: 'Source deleted',
        description: 'News source has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const syncSource = useMutation({
    mutationFn: async (sourceId: string) => {
      const { data, error } = await supabase.functions.invoke('sync-news-rss', {
        body: { sourceId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news-sources'] });
      toast({
        title: 'Sync complete',
        description: `Synced ${data?.synced || 0} articles.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Sync failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const syncAllSources = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sync-news-rss');

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news-sources'] });
      toast({
        title: 'Full sync complete',
        description: `Synced ${data?.synced || 0} articles from all sources.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Sync failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Stats computed from sources
  const stats = {
    total: sources?.length || 0,
    active: sources?.filter(s => s.is_active).length || 0,
    tier1: sources?.filter(s => s.tier === 1).length || 0,
    tier2: sources?.filter(s => s.tier === 2).length || 0,
    tier3: sources?.filter(s => s.tier === 3).length || 0,
    rss: sources?.filter(s => s.feed_type === 'rss').length || 0,
    scrape: sources?.filter(s => s.feed_type === 'scrape').length || 0,
    totalArticles: sources?.reduce((acc, s) => acc + s.articles_synced, 0) || 0,
    withErrors: sources?.filter(s => s.error_count > 0).length || 0,
  };

  return {
    sources,
    isLoading,
    error,
    stats,
    toggleSource,
    addSource,
    updateSource,
    deleteSource,
    syncSource,
    syncAllSources,
  };
}
