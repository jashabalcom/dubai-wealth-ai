import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

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
      return data.map(sp => sp.property_id);
    },
    enabled: !!user,
  });

  const saveProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('saved_properties')
        .insert({ user_id: user.id, property_id: propertyId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-properties'] });
      toast({ title: 'Property saved', description: 'Added to your favorites' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save property', variant: 'destructive' });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-properties'] });
      toast({ title: 'Property removed', description: 'Removed from your favorites' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to remove property', variant: 'destructive' });
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
