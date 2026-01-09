import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SyncSchedule {
  id: string;
  schedule_name: string;
  schedule_type: string;
  is_enabled: boolean;
  cron_expression: string;
  last_run_at: string | null;
  next_run_at: string | null;
  last_run_status: string | null;
  last_run_properties_synced: number;
  last_run_duration_seconds: number | null;
  config: {
    areas?: string;
    pages_per_area?: number;
    lite_mode?: boolean;
    include_rentals?: boolean;
    skip_recently_synced?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export function useSyncSchedule() {
  const [schedule, setSchedule] = useState<SyncSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRunningNow, setIsRunningNow] = useState(false);

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sync_schedules')
        .select('*')
        .eq('schedule_name', 'bayut_daily_sync')
        .single();

      if (error) throw error;
      setSchedule(data as unknown as SyncSchedule);
    } catch (error) {
      console.error('Failed to fetch sync schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSchedule = async (updates: Partial<Pick<SyncSchedule, 'is_enabled' | 'schedule_type' | 'cron_expression' | 'config'>>) => {
    if (!schedule) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('sync_schedules')
        .update(updates)
        .eq('id', schedule.id);

      if (error) throw error;
      
      await fetchSchedule();
      toast.success('Schedule updated');
    } catch (error) {
      console.error('Failed to update schedule:', error);
      toast.error('Failed to update schedule');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleEnabled = async () => {
    if (!schedule) return;
    await updateSchedule({ is_enabled: !schedule.is_enabled });
  };

  const updateConfig = async (configUpdates: Partial<SyncSchedule['config']>) => {
    if (!schedule) return;
    await updateSchedule({
      config: { ...schedule.config, ...configUpdates }
    });
  };

  const updateScheduleTime = async (hour: number) => {
    // Convert hour to cron expression (minute hour * * *)
    const cronExpression = `0 ${hour} * * *`;
    await updateSchedule({ cron_expression: cronExpression });
  };

  const runNow = async () => {
    setIsRunningNow(true);
    try {
      const { data, error } = await supabase.functions.invoke('scheduled-bayut-sync', {
        body: { triggered_by: 'manual' },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Sync completed: ${data.totalPropertiesSynced} properties`);
        await fetchSchedule();
      } else if (data?.skipped) {
        toast.info('Sync skipped: schedule is disabled');
      } else {
        toast.error(data?.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Failed to run sync:', error);
      toast.error('Failed to trigger sync');
    } finally {
      setIsRunningNow(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  return {
    schedule,
    isLoading,
    isUpdating,
    isRunningNow,
    fetchSchedule,
    updateSchedule,
    toggleEnabled,
    updateConfig,
    updateScheduleTime,
    runNow,
  };
}
