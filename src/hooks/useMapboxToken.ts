import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMapboxToken() {
  const { data: token, isLoading: loading, error } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.token) throw new Error('No token returned');
      
      return data.token as string;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
    retry: 2,
  });

  return { 
    token: token || null, 
    loading, 
    error: error instanceof Error ? error.message : null 
  };
}
