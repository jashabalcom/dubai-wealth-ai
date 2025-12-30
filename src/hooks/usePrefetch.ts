import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePrefetch() {
  const queryClient = useQueryClient();
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prefetchPropertyDetail = useCallback((slug: string) => {
    // Cancel any existing timeout
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    // Delay prefetch to avoid excessive calls on quick hover
    prefetchTimeoutRef.current = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ['property', slug],
        queryFn: async () => {
          const { data } = await supabase
            .from('properties')
            .select('*')
            .eq('slug', slug)
            .single();
          return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    }, 200);
  }, [queryClient]);

  const cancelPrefetch = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
  }, []);

  const prefetchCalendarEvents = useCallback((month: number, year: number) => {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0).toISOString();

    queryClient.prefetchQuery({
      queryKey: ['calendar-events-month', year, month],
      queryFn: async () => {
        const { data } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('is_published', true)
          .gte('event_date', startDate)
          .lte('event_date', endDate)
          .order('event_date', { ascending: true });
        return data;
      },
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  const prefetchNextPropertiesPage = useCallback((page: number, pageSize: number = 12) => {
    queryClient.prefetchQuery({
      queryKey: ['properties', 'list', page + 1, pageSize],
      queryFn: async () => {
        const from = (page) * pageSize;
        const to = from + pageSize - 1;
        
        const { data } = await supabase
          .from('properties')
          .select('*')
          .eq('is_published', true)
          .range(from, to)
          .order('created_at', { ascending: false });
        return data;
      },
      staleTime: 1000 * 60 * 2,
    });
  }, [queryClient]);

  return {
    prefetchPropertyDetail,
    cancelPrefetch,
    prefetchCalendarEvents,
    prefetchNextPropertiesPage,
  };
}
