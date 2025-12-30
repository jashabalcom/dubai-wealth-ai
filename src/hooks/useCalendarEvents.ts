import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: 'launch' | 'handover' | 'conference' | 'report' | 'regulatory' | 'economic';
  event_date: string;
  end_date: string | null;
  developer_id: string | null;
  location_area: string | null;
  project_name: string | null;
  importance: 'high' | 'normal' | 'low';
  external_url: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface CalendarFilters {
  eventTypes?: string[];
  startDate?: string;
  endDate?: string;
  importance?: string;
  locationArea?: string;
}

export function useCalendarEvents(filters?: CalendarFilters) {
  return useQuery({
    queryKey: ['calendar-events', filters],
    queryFn: async () => {
      let query = supabase
        .from('calendar_events')
        .select('*')
        .eq('is_published', true)
        .order('event_date', { ascending: true });

      if (filters?.eventTypes && filters.eventTypes.length > 0) {
        query = query.in('event_type', filters.eventTypes);
      }

      if (filters?.startDate) {
        query = query.gte('event_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('event_date', filters.endDate);
      }

      if (filters?.importance) {
        query = query.eq('importance', filters.importance);
      }

      if (filters?.locationArea) {
        query = query.eq('location_area', filters.locationArea);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CalendarEvent[];
    },
  });
}

export function useUpcomingEvents(days: number = 30) {
  const today = new Date().toISOString().split('T')[0];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  const endDateStr = endDate.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['upcoming-events', days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('is_published', true)
        .gte('event_date', today)
        .lte('event_date', endDateStr)
        .order('event_date', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });
}

export function useCalendarEventsByMonth(year: number, month: number) {
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['calendar-events-month', year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('is_published', true)
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });
}

// Admin mutations
export function useAdminCalendarEvents() {
  const queryClient = useQueryClient();

  const createEvent = useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-events'] });
    },
  });

  return { createEvent, updateEvent, deleteEvent };
}

// Get unique locations for filtering
export function useCalendarLocations() {
  return useQuery({
    queryKey: ['calendar-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('location_area')
        .eq('is_published', true)
        .not('location_area', 'is', null);

      if (error) throw error;
      
      const locations = [...new Set(data?.map(d => d.location_area).filter(Boolean))] as string[];
      return locations.sort();
    },
  });
}
