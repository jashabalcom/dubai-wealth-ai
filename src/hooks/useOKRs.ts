import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OKRObjective {
  id: string;
  title: string;
  description: string | null;
  timeframe: string;
  quarter: string | null;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  key_results?: OKRKeyResult[];
}

export interface OKRKeyResult {
  id: string;
  objective_id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  due_date: string | null;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface OKRUpdate {
  id: string;
  key_result_id: string;
  previous_value: number | null;
  new_value: number;
  notes: string | null;
  recorded_by: string | null;
  recorded_at: string;
}

export function useOKRs() {
  const queryClient = useQueryClient();

  const { data: objectives, isLoading } = useQuery({
    queryKey: ['okr-objectives'],
    queryFn: async () => {
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('okr_objectives')
        .select('*')
        .order('created_at', { ascending: false });

      if (objectivesError) throw objectivesError;

      // Fetch key results for each objective
      const objectivesWithKRs = await Promise.all(
        (objectivesData || []).map(async (obj) => {
          const { data: keyResults } = await supabase
            .from('okr_key_results')
            .select('*')
            .eq('objective_id', obj.id)
            .order('created_at', { ascending: true });

          return {
            ...obj,
            key_results: keyResults || [],
          } as OKRObjective;
        })
      );

      return objectivesWithKRs;
    },
  });

  const createObjective = useMutation({
    mutationFn: async (data: { title: string; description?: string; timeframe: string; quarter?: string }) => {
      const { data: result, error } = await supabase
        .from('okr_objectives')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-objectives'] });
      toast.success('Objective created');
    },
    onError: (error) => {
      toast.error('Failed to create objective: ' + error.message);
    },
  });

  const updateObjective = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; description?: string; status?: string }) => {
      const { error } = await supabase
        .from('okr_objectives')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-objectives'] });
      toast.success('Objective updated');
    },
    onError: (error) => {
      toast.error('Failed to update objective: ' + error.message);
    },
  });

  const deleteObjective = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('okr_objectives')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-objectives'] });
      toast.success('Objective deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete objective: ' + error.message);
    },
  });

  const createKeyResult = useMutation({
    mutationFn: async (data: { objective_id: string; title: string; target_value: number; unit: string; due_date?: string }) => {
      const { data: result, error } = await supabase
        .from('okr_key_results')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-objectives'] });
      toast.success('Key result added');
    },
    onError: (error) => {
      toast.error('Failed to add key result: ' + error.message);
    },
  });

  const updateKeyResult = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; current_value?: number; status?: string; title?: string; target_value?: number }) => {
      const { error } = await supabase
        .from('okr_key_results')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-objectives'] });
    },
    onError: (error) => {
      toast.error('Failed to update key result: ' + error.message);
    },
  });

  const recordProgress = useMutation({
    mutationFn: async ({ key_result_id, previous_value, new_value, notes }: { key_result_id: string; previous_value: number; new_value: number; notes?: string }) => {
      // Insert the update record
      const { error: updateError } = await supabase
        .from('okr_updates')
        .insert({ key_result_id, previous_value, new_value, notes });

      if (updateError) throw updateError;

      // Update the key result current value
      const progress = (new_value / 100) * 100; // Assuming target is the denominator
      let status: 'on_track' | 'at_risk' | 'behind' | 'completed' = 'on_track';
      
      // Get the target value to calculate status
      const { data: kr } = await supabase
        .from('okr_key_results')
        .select('target_value')
        .eq('id', key_result_id)
        .single();

      if (kr) {
        const progressPercent = (new_value / kr.target_value) * 100;
        if (progressPercent >= 100) status = 'completed';
        else if (progressPercent >= 70) status = 'on_track';
        else if (progressPercent >= 40) status = 'at_risk';
        else status = 'behind';
      }

      const { error: krError } = await supabase
        .from('okr_key_results')
        .update({ current_value: new_value, status })
        .eq('id', key_result_id);

      if (krError) throw krError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-objectives'] });
      toast.success('Progress recorded');
    },
    onError: (error) => {
      toast.error('Failed to record progress: ' + error.message);
    },
  });

  const deleteKeyResult = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('okr_key_results')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-objectives'] });
      toast.success('Key result deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete key result: ' + error.message);
    },
  });

  // Calculate stats
  const stats = {
    totalObjectives: objectives?.filter(o => o.status === 'active').length || 0,
    onTrack: objectives?.flatMap(o => o.key_results || []).filter(kr => kr.status === 'on_track').length || 0,
    atRisk: objectives?.flatMap(o => o.key_results || []).filter(kr => kr.status === 'at_risk').length || 0,
    behind: objectives?.flatMap(o => o.key_results || []).filter(kr => kr.status === 'behind').length || 0,
    completed: objectives?.flatMap(o => o.key_results || []).filter(kr => kr.status === 'completed').length || 0,
    totalKeyResults: objectives?.flatMap(o => o.key_results || []).length || 0,
  };

  return {
    objectives,
    isLoading,
    stats,
    createObjective,
    updateObjective,
    deleteObjective,
    createKeyResult,
    updateKeyResult,
    deleteKeyResult,
    recordProgress,
  };
}
