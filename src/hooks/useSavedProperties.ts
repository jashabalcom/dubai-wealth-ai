import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cacheSavedPropertyIds, getCachedSavedPropertyIds } from '@/lib/offlineCache';

export function useSavedProperties() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedPropertyIds = [], isLoading } = useQuery({
    queryKey: ['saved-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      const ids = data.map(sp => sp.property_id);
      // Cache for offline use
      cacheSavedPropertyIds(ids);
      return ids;
    },
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds
    placeholderData: () => getCachedSavedPropertyIds(),
  });

  const saveProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('saved_properties')
        .insert({ user_id: user.id, property_id: propertyId });
      if (error) throw error;
    },
    // Optimistic update
    onMutate: async (propertyId: string) => {
      await queryClient.cancelQueries({ queryKey: ['saved-properties', user?.id] });
      const previousIds = queryClient.getQueryData<string[]>(['saved-properties', user?.id]) || [];
      queryClient.setQueryData(['saved-properties', user?.id], [...previousIds, propertyId]);
      return { previousIds };
    },
    onError: (error, propertyId, context) => {
      // Rollback on error
      if (context?.previousIds) {
        queryClient.setQueryData(['saved-properties', user?.id], context.previousIds);
      }
      toast({ title: 'Error', description: 'Failed to save property', variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Property saved', description: 'Added to your favorites' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-properties'] });
    },
  });

  const unsaveProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);
      if (error) throw error;
    },
    // Optimistic update
    onMutate: async (propertyId: string) => {
      await queryClient.cancelQueries({ queryKey: ['saved-properties', user?.id] });
      const previousIds = queryClient.getQueryData<string[]>(['saved-properties', user?.id]) || [];
      queryClient.setQueryData(
        ['saved-properties', user?.id], 
        previousIds.filter(id => id !== propertyId)
      );
      return { previousIds };
    },
    onError: (error, propertyId, context) => {
      // Rollback on error
      if (context?.previousIds) {
        queryClient.setQueryData(['saved-properties', user?.id], context.previousIds);
      }
      toast({ title: 'Error', description: 'Failed to remove property', variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Property removed', description: 'Removed from your favorites' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-properties'] });
    },
  });

  const toggleSave = (propertyId: string) => {
    if (savedPropertyIds.includes(propertyId)) {
      unsaveProperty.mutate(propertyId);
    } else {
      saveProperty.mutate(propertyId);
    }
  };

  const isSaved = (propertyId: string) => savedPropertyIds.includes(propertyId);

  return {
    savedPropertyIds,
    isLoading,
    toggleSave,
    isSaved,
    isToggling: saveProperty.isPending || unsaveProperty.isPending,
  };
}
