import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useMapboxToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) throw error;
        if (data?.token) {
          setToken(data.token);
        } else if (data?.error) {
          setError(data.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map');
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  return { token, loading, error };
}
