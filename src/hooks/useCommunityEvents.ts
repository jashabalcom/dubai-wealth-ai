import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface CommunityEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  duration_minutes: number;
  event_type: string;
  meeting_platform: string;
  meeting_url: string | null;
  meeting_id: string | null;
  cover_image_url: string | null;
  visibility: 'all_members' | 'elite_only';
  max_attendees: number | null;
  is_published: boolean;
  is_live: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  recording_url: string | null;
  recording_visible: boolean;
  recording_access: 'all_members' | 'elite_only';
  use_embedded_meeting?: boolean;
  jitsi_room_name?: string | null;
  registrations_count?: number;
  is_registered?: boolean;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
  status: string;
}

export function useCommunityEvents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['community-events', user?.id],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('community_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;

      // Get registrations for each event
      const eventsWithRegistrations = await Promise.all(
        (events || []).map(async (event) => {
          const { count } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'registered');

          let isRegistered = false;
          if (user) {
            const { data: registration } = await supabase
              .from('event_registrations')
              .select('id')
              .eq('event_id', event.id)
              .eq('user_id', user.id)
              .eq('status', 'registered')
              .maybeSingle();
            isRegistered = !!registration;
          }

          return {
            ...event,
            registrations_count: count || 0,
            is_registered: isRegistered,
          } as CommunityEvent;
        })
      );

      return eventsWithRegistrations;
    },
    enabled: !!user,
  });

  // Subscribe to realtime updates for live status changes
  useEffect(() => {
    const channel = supabase
      .channel('community-events-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_events'
        },
        () => {
          // Invalidate and refetch when any event is updated
          queryClient.invalidateQueries({ queryKey: ['community-events'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'registered',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-events'] });
      toast({ title: 'Registered successfully!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to register', description: error.message, variant: 'destructive' });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-events'] });
      toast({ title: 'Unregistered from event' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to unregister', description: error.message, variant: 'destructive' });
    },
  });

  return {
    events: eventsQuery.data || [],
    eventsLoading: eventsQuery.isLoading,
    register: registerMutation,
    unregister: unregisterMutation,
  };
}

export function useAdminEvents() {
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;

      // Get registrations count for each event
      const eventsWithCounts = await Promise.all(
        (data || []).map(async (event) => {
          const { count } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'registered');

          return {
            ...event,
            registrations_count: count || 0,
          } as CommunityEvent;
        })
      );

      return eventsWithCounts;
    },
  });

  const createEvent = useMutation({
    mutationFn: async (eventData: Omit<CommunityEvent, 'id' | 'created_at' | 'updated_at' | 'registrations_count' | 'is_registered'>) => {
      const { error } = await supabase
        .from('community_events')
        .insert(eventData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({ title: 'Event created successfully!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create event', description: error.message, variant: 'destructive' });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<CommunityEvent> & { id: string }) => {
      const { error } = await supabase
        .from('community_events')
        .update(eventData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({ title: 'Event updated successfully!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update event', description: error.message, variant: 'destructive' });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('community_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({ title: 'Event deleted successfully!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete event', description: error.message, variant: 'destructive' });
    },
  });

  return {
    events: eventsQuery.data || [],
    eventsLoading: eventsQuery.isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
