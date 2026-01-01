import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DailyDigest {
  id: string;
  digest_date: string;
  headline: string;
  executive_summary: string;
  market_sentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  key_metrics: Record<string, string>;
  sector_highlights: Record<string, string>;
  area_highlights: Record<string, string>;
  top_article_ids: string[];
  is_published: boolean;
  created_at: string;
}

export function useLatestDigest() {
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatestDigest() {
      try {
        const { data, error: fetchError } = await supabase
          .from('daily_market_digests')
          .select('*')
          .eq('is_published', true)
          .order('digest_date', { ascending: false })
          .limit(1)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (data) {
          setDigest({
            ...data,
            key_metrics: data.key_metrics as Record<string, string> || {},
            sector_highlights: data.sector_highlights as Record<string, string> || {},
            area_highlights: data.area_highlights as Record<string, string> || {},
            market_sentiment: data.market_sentiment as DailyDigest['market_sentiment'] || 'neutral',
          });
        }
      } catch (err) {
        console.error('Error fetching latest digest:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch digest');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLatestDigest();
  }, []);

  return { digest, isLoading, error };
}

export function useDigestByDate(date: string) {
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) {
      setIsLoading(false);
      return;
    }

    async function fetchDigest() {
      try {
        const { data, error: fetchError } = await supabase
          .from('daily_market_digests')
          .select('*')
          .eq('digest_date', date)
          .eq('is_published', true)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          setDigest({
            ...data,
            key_metrics: data.key_metrics as Record<string, string> || {},
            sector_highlights: data.sector_highlights as Record<string, string> || {},
            area_highlights: data.area_highlights as Record<string, string> || {},
            market_sentiment: data.market_sentiment as DailyDigest['market_sentiment'] || 'neutral',
          });
        }
      } catch (err) {
        console.error('Error fetching digest by date:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch digest');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDigest();
  }, [date]);

  return { digest, isLoading, error };
}

export function useDigestAdmin() {
  const [digests, setDigests] = useState<DailyDigest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchDigests = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('daily_market_digests')
        .select('*')
        .order('digest_date', { ascending: false })
        .limit(30);

      if (error) throw error;

      setDigests((data || []).map(d => ({
        ...d,
        key_metrics: d.key_metrics as Record<string, string> || {},
        sector_highlights: d.sector_highlights as Record<string, string> || {},
        area_highlights: d.area_highlights as Record<string, string> || {},
        market_sentiment: d.market_sentiment as DailyDigest['market_sentiment'] || 'neutral',
      })));
    } catch (err) {
      console.error('Error fetching digests:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDigests();
  }, [fetchDigests]);

  const generateDigest = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-daily-digest');
      if (error) throw error;
      await fetchDigests();
      return data;
    } finally {
      setIsGenerating(false);
    }
  };

  const publishDigest = async (id: string) => {
    const { error } = await supabase
      .from('daily_market_digests')
      .update({ is_published: true })
      .eq('id', id);
    
    if (error) throw error;
    await fetchDigests();
  };

  const unpublishDigest = async (id: string) => {
    const { error } = await supabase
      .from('daily_market_digests')
      .update({ is_published: false })
      .eq('id', id);
    
    if (error) throw error;
    await fetchDigests();
  };

  return {
    digests,
    isLoading,
    isGenerating,
    generateDigest,
    publishDigest,
    unpublishDigest,
    refetch: fetchDigests,
  };
}
