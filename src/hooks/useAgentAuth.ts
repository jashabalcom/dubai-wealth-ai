import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type Agent = Database['public']['Tables']['agents']['Row'];

export function useAgentAuth() {
  const { user, loading: authLoading } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgent = useCallback(async () => {
    if (!user) {
      setAgent(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching agent:', error);
      }
      
      setAgent(data || null);
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchAgent();
    }
  }, [user, authLoading, fetchAgent]);

  const isAgent = !!agent;

  return {
    user,
    agent,
    isAgent,
    loading: authLoading || loading,
    refetchAgent: fetchAgent,
  };
}
