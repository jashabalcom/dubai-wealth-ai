import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VideoProgress {
  watch_progress_percent: number;
  last_position_seconds: number;
  video_duration_seconds: number | null;
  is_completed: boolean;
}

interface UseVideoProgressReturn {
  progress: VideoProgress | null;
  loading: boolean;
  saveProgress: (positionSeconds: number, durationSeconds: number) => void;
  markComplete: () => Promise<void>;
}

export function useVideoProgress(lessonId: string | undefined): UseVideoProgressReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<VideoProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPositionRef = useRef<number>(0);

  // Load progress on mount
  useEffect(() => {
    if (!user || !lessonId) {
      setLoading(false);
      return;
    }

    const loadProgress = async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('watch_progress_percent, last_position_seconds, video_duration_seconds, is_completed')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setProgress({
          watch_progress_percent: data.watch_progress_percent || 0,
          last_position_seconds: data.last_position_seconds || 0,
          video_duration_seconds: data.video_duration_seconds,
          is_completed: data.is_completed || false,
        });
        lastSavedPositionRef.current = data.last_position_seconds || 0;
      } else {
        setProgress({
          watch_progress_percent: 0,
          last_position_seconds: 0,
          video_duration_seconds: null,
          is_completed: false,
        });
      }
      setLoading(false);
    };

    loadProgress();

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [user, lessonId]);

  // Debounced save progress (saves every 10 seconds or on significant change)
  const saveProgress = useCallback(
    (positionSeconds: number, durationSeconds: number) => {
      if (!user || !lessonId || durationSeconds <= 0) return;

      const percent = Math.round((positionSeconds / durationSeconds) * 100);
      const shouldAutoComplete = percent >= 90;

      // Update local state immediately
      setProgress((prev) => ({
        watch_progress_percent: percent,
        last_position_seconds: Math.round(positionSeconds),
        video_duration_seconds: Math.round(durationSeconds),
        is_completed: shouldAutoComplete || (prev?.is_completed ?? false),
      }));

      // Only save if position changed by at least 5 seconds
      if (Math.abs(positionSeconds - lastSavedPositionRef.current) < 5) {
        return;
      }

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce the save
      saveTimeoutRef.current = setTimeout(async () => {
        lastSavedPositionRef.current = positionSeconds;

        const updateData = {
          user_id: user.id,
          lesson_id: lessonId,
          watch_progress_percent: percent,
          last_position_seconds: Math.round(positionSeconds),
          video_duration_seconds: Math.round(durationSeconds),
          last_watched_at: new Date().toISOString(),
          ...(shouldAutoComplete && {
            is_completed: true,
            completed_at: new Date().toISOString(),
          }),
        };

        await supabase.from('lesson_progress').upsert(updateData);
      }, 2000); // Save after 2 seconds of no updates
    },
    [user, lessonId]
  );

  // Manual mark complete
  const markComplete = useCallback(async () => {
    if (!user || !lessonId) return;

    const { error } = await supabase.from('lesson_progress').upsert({
      user_id: user.id,
      lesson_id: lessonId,
      is_completed: true,
      completed_at: new Date().toISOString(),
      watch_progress_percent: 100,
      last_watched_at: new Date().toISOString(),
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Could not mark lesson as complete.',
        variant: 'destructive',
      });
      return;
    }

    setProgress((prev) => (prev ? { ...prev, is_completed: true, watch_progress_percent: 100 } : null));
    toast({
      title: 'Lesson completed!',
      description: 'Great job! Keep learning.',
    });
  }, [user, lessonId, toast]);

  return {
    progress,
    loading,
    saveProgress,
    markComplete,
  };
}
