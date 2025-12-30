import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserPropertyEvent {
  id: string;
  user_id: string;
  portfolio_property_id: string | null;
  title: string;
  notes: string | null;
  event_type: 'service_charge' | 'rental_renewal' | 'mortgage_payment' | 'inspection' | 'visa_renewal' | 'custom';
  event_date: string;
  reminder_days_before: number;
  is_recurring: boolean;
  recurrence_interval: 'monthly' | 'quarterly' | 'yearly' | null;
  is_completed: boolean;
  created_at: string;
}

export function useUserPropertyEvents() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-property-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_property_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as UserPropertyEvent[];
    },
    enabled: !!user?.id,
  });
}

export function useUpcomingUserEvents(days: number = 30) {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  const endDateStr = endDate.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['upcoming-user-events', user?.id, days],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_property_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .gte('event_date', today)
        .lte('event_date', endDateStr)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as UserPropertyEvent[];
    },
    enabled: !!user?.id,
  });
}

export function useUserPropertyEventMutations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createEvent = useMutation({
    mutationFn: async (event: Omit<UserPropertyEvent, 'id' | 'user_id' | 'created_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_property_events')
        .insert({ ...event, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic update
    onMutate: async (newEvent) => {
      await queryClient.cancelQueries({ queryKey: ['user-property-events', user?.id] });
      await queryClient.cancelQueries({ queryKey: ['upcoming-user-events', user?.id] });
      
      const previousEvents = queryClient.getQueryData<UserPropertyEvent[]>(['user-property-events', user?.id]) || [];
      
      const optimisticEvent: UserPropertyEvent = {
        id: `temp-${Date.now()}`,
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        ...newEvent,
      };
      
      queryClient.setQueryData(['user-property-events', user?.id], [optimisticEvent, ...previousEvents]);
      return { previousEvents };
    },
    onError: (error, newEvent, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['user-property-events', user?.id], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-property-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-user-events'] });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserPropertyEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('user_property_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['user-property-events', user?.id] });
      const previousEvents = queryClient.getQueryData<UserPropertyEvent[]>(['user-property-events', user?.id]) || [];
      
      queryClient.setQueryData(
        ['user-property-events', user?.id],
        previousEvents.map(e => e.id === id ? { ...e, ...updates } : e)
      );
      return { previousEvents };
    },
    onError: (error, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['user-property-events', user?.id], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-property-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-user-events'] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_property_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['user-property-events', user?.id] });
      const previousEvents = queryClient.getQueryData<UserPropertyEvent[]>(['user-property-events', user?.id]) || [];
      
      queryClient.setQueryData(
        ['user-property-events', user?.id],
        previousEvents.filter(e => e.id !== id)
      );
      return { previousEvents };
    },
    onError: (error, id, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['user-property-events', user?.id], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-property-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-user-events'] });
    },
  });

  const markComplete = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('user_property_events')
        .update({ is_completed: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['user-property-events', user?.id] });
      const previousEvents = queryClient.getQueryData<UserPropertyEvent[]>(['user-property-events', user?.id]) || [];
      
      queryClient.setQueryData(
        ['user-property-events', user?.id],
        previousEvents.map(e => e.id === id ? { ...e, is_completed: true } : e)
      );
      return { previousEvents };
    },
    onError: (error, id, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['user-property-events', user?.id], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-property-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-user-events'] });
    },
  });

  return { createEvent, updateEvent, deleteEvent, markComplete };
}
