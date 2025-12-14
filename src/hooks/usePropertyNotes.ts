import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useCallback, useState, useEffect } from 'react';

interface PropertyNote {
  id: string;
  user_id: string;
  property_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function usePropertyNotes(propertyId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [debouncedContent, setDebouncedContent] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: note, isLoading } = useQuery({
    queryKey: ['property-note', propertyId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('property_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle();
      
      if (error) throw error;
      return data as PropertyNote | null;
    },
    enabled: !!user && !!propertyId,
  });

  const upsertNote = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Must be logged in');
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from('property_notes')
        .upsert(
          { 
            user_id: user.id, 
            property_id: propertyId, 
            content,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id,property_id' }
        )
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-note', propertyId] });
      setIsSaving(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save note', variant: 'destructive' });
      setIsSaving(false);
    },
  });

  const deleteNote = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('property_notes')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-note', propertyId] });
      toast({ title: 'Note deleted', description: 'Your note has been removed' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete note', variant: 'destructive' });
    },
  });

  // Debounced auto-save
  useEffect(() => {
    if (debouncedContent === null) return;
    
    const timer = setTimeout(() => {
      if (debouncedContent.trim()) {
        upsertNote.mutate(debouncedContent);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [debouncedContent]);

  const saveNote = useCallback((content: string) => {
    setDebouncedContent(content);
  }, []);

  const saveNoteImmediate = useCallback((content: string) => {
    if (content.trim()) {
      upsertNote.mutate(content);
    }
  }, [upsertNote]);

  return {
    note,
    isLoading,
    isSaving: isSaving || upsertNote.isPending,
    saveNote,
    saveNoteImmediate,
    deleteNote: deleteNote.mutate,
    isDeleting: deleteNote.isPending,
  };
}
