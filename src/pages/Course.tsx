import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  BookOpen, 
  BarChart3, 
  Play, 
  CheckCircle2, 
  Lock,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  category: string;
  thumbnail_url: string;
  duration_minutes: number;
}

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string;
  order_index: number;
  duration_minutes: number;
  is_free_preview: boolean;
}

interface LessonProgress {
  lesson_id: string;
  is_completed: boolean;
}

const levelColors: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-400',
  intermediate: 'bg-blue-500/20 text-blue-400',
  advanced: 'bg-purple-500/20 text-purple-400',
};

export default function Course() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  useEffect(() => {
    if (user && course) {
      fetchProgress();
    }
  }, [user, course]);

  const fetchCourse = async () => {
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (courseError || !courseData) {
      navigate('/academy');
      return;
    }

    setCourse(courseData);

    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseData.id)
      .order('order_index');

    if (lessonsData) {
      setLessons(lessonsData);
    }

    setLoading(false);
  };

  const fetchProgress = async () => {
    if (!course) return;

    const lessonIds = lessons.map((l) => l.id);
    const { data } = await supabase
      .from('lesson_progress')
      .select('lesson_id, is_completed')
      .in('lesson_id', lessonIds);

    if (data) {
      setProgress(data);
    }
  };

  const getCompletedCount = () => {
    return progress.filter((p) => p.is_completed).length;
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.find((p) => p.lesson_id === lessonId)?.is_completed || false;
  };

  const canAccessLesson = (lesson: Lesson) => {
    if (lesson.is_free_preview) return true;
    if (!user) return false;
    // All logged-in users can access for now (membership check can be added later)
    return true;
  };

  const getNextLesson = () => {
    for (const lesson of lessons) {
      if (!isLessonCompleted(lesson.id) && canAccessLesson(lesson)) {
        return lesson;
      }
    }
    return lessons[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const completedCount = getCompletedCount();
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const nextLesson = getNextLesson();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary-dark to-background">
        <div className="container mx-auto px-4">
          <Link
            to="/academy"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Academy
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${levelColors[course.level] || levelColors.beginner}`}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </span>
                <span className="text-sm text-muted-foreground">{course.category}</span>
              </div>

              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
                {course.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>{Math.round(course.duration_minutes / 60)}h {course.duration_minutes % 60}m</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-5 h-5" />
                  <span>{lessons.length} lessons</span>
                </div>
                {user && (
                  <div className="flex items-center gap-2 text-gold">
                    <BarChart3 className="w-5 h-5" />
                    <span>{progressPercent}% complete</span>
                  </div>
                )}
              </div>

              {nextLesson && (
                <Link to={`/academy/${course.slug}/${nextLesson.slug}`}>
                  <Button variant="gold" size="lg">
                    <Play className="w-5 h-5 mr-2" />
                    {completedCount > 0 ? 'Continue Learning' : 'Start Course'}
                  </Button>
                </Link>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl overflow-hidden border border-border">
                <img
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {nextLesson && (
                  <Link
                    to={`/academy/${course.slug}/${nextLesson.slug}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary-dark fill-primary-dark ml-1" />
                    </div>
                  </Link>
                )}
              </div>

              {/* Progress bar */}
              {user && progressPercent > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-muted rounded-b-2xl overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Lessons List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl text-foreground mb-8">
            Course Content
          </h2>

          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const completed = isLessonCompleted(lesson.id);
              const canAccess = canAccessLesson(lesson);

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {canAccess ? (
                    <Link
                      to={`/academy/${course.slug}/${lesson.slug}`}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-gold/30 transition-all duration-300"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        completed 
                          ? 'bg-gold text-primary-dark' 
                          : 'bg-muted text-muted-foreground group-hover:bg-gold/20 group-hover:text-gold'
                      }`}>
                        {completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="font-medium">{lesson.order_index}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground group-hover:text-gold transition-colors truncate">
                            {lesson.title}
                          </h3>
                          {lesson.is_free_preview && (
                            <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                              Free Preview
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {lesson.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{lesson.duration_minutes}min</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border opacity-60">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {lesson.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{lesson.duration_minutes}min</span>
                        <Lock className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {!user && (
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-gold/10 via-gold/5 to-transparent border border-gold/20 text-center">
              <p className="text-muted-foreground mb-4">
                Sign in to track your progress and access all lessons.
              </p>
              <Link to="/auth">
                <Button variant="gold">Sign In to Continue</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
