import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LearningProgress {
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  currentCourse: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
  } | null;
  lastLesson: {
    id: string;
    title: string;
    slug: string;
    courseSlug: string;
    position: number;
    duration: number;
  } | null;
  hoursLearned: number;
}

export function useLearningProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['learning-progress', user?.id],
    queryFn: async (): Promise<LearningProgress> => {
      if (!user?.id) {
        return {
          totalLessons: 0,
          completedLessons: 0,
          progressPercent: 0,
          currentCourse: null,
          lastLesson: null,
          hoursLearned: 0,
        };
      }

      // Fetch total published lessons count
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id')
        .eq('is_published', true);
      
      const courseIds = coursesData?.map(c => c.id) || [];
      
      let totalLessons = 0;
      if (courseIds.length > 0) {
        const { count } = await supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .in('course_id', courseIds);
        totalLessons = count || 0;
      }

      // Fetch user's lesson progress
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select(`
          lesson_id,
          is_completed,
          last_position_seconds,
          video_duration_seconds,
          last_watched_at,
          lessons!inner (
            id,
            title,
            slug,
            duration_minutes,
            courses!inner (
              id,
              title,
              slug,
              thumbnail_url,
              is_published
            )
          )
        `)
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false });

      const completedLessons = progressData?.filter(p => p.is_completed).length || 0;
      const total = totalLessons || 0;
      const progressPercent = total > 0 ? Math.round((completedLessons / total) * 100) : 0;

      // Calculate hours learned from completed lessons
      const hoursLearned = progressData?.reduce((acc, p) => {
        const minutes = (p.lessons as any)?.duration_minutes || 0;
        return acc + (p.is_completed ? minutes : 0);
      }, 0) || 0;

      // Find last watched lesson (not completed)
      const lastWatched = progressData?.find(p => !p.is_completed && p.last_position_seconds && p.last_position_seconds > 0);
      
      let lastLesson = null;
      let currentCourse = null;

      if (lastWatched) {
        const lesson = lastWatched.lessons as any;
        const course = lesson?.courses;
        
        lastLesson = {
          id: lesson.id,
          title: lesson.title,
          slug: lesson.slug,
          courseSlug: course?.slug || '',
          position: lastWatched.last_position_seconds || 0,
          duration: lastWatched.video_duration_seconds || (lesson.duration_minutes * 60) || 0,
        };

        currentCourse = {
          id: course?.id || '',
          title: course?.title || '',
          slug: course?.slug || '',
          thumbnailUrl: course?.thumbnail_url || null,
        };
      }

      return {
        totalLessons: total,
        completedLessons,
        progressPercent,
        currentCourse,
        lastLesson,
        hoursLearned: Math.round(hoursLearned / 60 * 10) / 10, // Convert to hours with 1 decimal
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
