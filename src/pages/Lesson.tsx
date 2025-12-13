import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  List,
  X,
  Clock,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { VideoPlayer } from '@/components/lessons/VideoPlayer';
import { ResourceList } from '@/components/lessons/ResourceList';
import { sanitizeMarkdownHtml } from '@/lib/sanitize';

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface Resource {
  name: string;
  url: string;
  type: string;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  description: string;
  video_url: string | null;
  content: string | null;
  order_index: number;
  duration_minutes: number;
  is_free_preview: boolean;
  resources: unknown;
}

export default function Lesson() {
  const { courseSlug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Check if user can access the lesson
  const canAccessLesson = (lessonData: Lesson) => {
    if (lessonData.is_free_preview) return true;
    if (!profile) return false;
    const tierOrder = { free: 0, investor: 1, elite: 2 };
    const userTierLevel = tierOrder[profile.membership_tier as keyof typeof tierOrder] || 0;
    return userTierLevel >= 1; // investor or elite can access
  };

  useEffect(() => {
    if (courseSlug && lessonSlug) {
      fetchData();
    }
  }, [courseSlug, lessonSlug, profile]);

  useEffect(() => {
    if (user && lesson) {
      checkProgress();
    }
  }, [user, lesson]);

  const fetchData = async () => {
    // Fetch course
    const { data: courseData } = await supabase
      .from('courses')
      .select('id, title, slug')
      .eq('slug', courseSlug)
      .eq('is_published', true)
      .maybeSingle();

    if (!courseData) {
      navigate('/academy');
      return;
    }

    setCourse(courseData);

    // Fetch all lessons for the course
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseData.id)
      .order('order_index');

    if (lessonsData) {
      setLessons(lessonsData);

      // Find current lesson
      const currentLesson = lessonsData.find((l) => l.slug === lessonSlug);
      if (currentLesson) {
        // Check access before showing lesson
        if (!canAccessLesson(currentLesson)) {
          setAccessDenied(true);
          setLesson(currentLesson);
          setLoading(false);
          return;
        }
        setAccessDenied(false);
        setLesson(currentLesson);
      } else {
        navigate(`/academy/${courseSlug}`);
        return;
      }
    }

    setLoading(false);
  };

  const checkProgress = async () => {
    if (!lesson) return;

    // Check if current lesson is completed
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('is_completed')
      .eq('lesson_id', lesson.id)
      .maybeSingle();

    setIsCompleted(progressData?.is_completed || false);

    // Get all completed lessons for sidebar
    const lessonIds = lessons.map((l) => l.id);
    const { data: allProgress } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .in('lesson_id', lessonIds)
      .eq('is_completed', true);

    if (allProgress) {
      setCompletedLessons(allProgress.map((p) => p.lesson_id));
    }
  };

  const markAsComplete = async () => {
    if (!user || !lesson) return;

    const { error } = await supabase
      .from('lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Could not mark lesson as complete.',
        variant: 'destructive',
      });
      return;
    }

    setIsCompleted(true);
    setCompletedLessons([...completedLessons, lesson.id]);
    toast({
      title: 'Lesson completed!',
      description: 'Great job! Keep learning.',
    });
  };

  const getPrevLesson = () => {
    if (!lesson) return null;
    const currentIndex = lessons.findIndex((l) => l.id === lesson.id);
    return currentIndex > 0 ? lessons[currentIndex - 1] : null;
  };

  const getNextLesson = () => {
    if (!lesson) return null;
    const currentIndex = lessons.findIndex((l) => l.id === lesson.id);
    return currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!course || !lesson) return null;

  // Show upgrade prompt for locked lessons
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-heading text-2xl text-foreground mb-4">
            Premium Content
          </h1>
          <p className="text-muted-foreground mb-6">
            This lesson is available to Dubai Investor and Elite members. Upgrade your membership to unlock the full academy.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(`/academy/${courseSlug}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
            <Button variant="gold" onClick={() => navigate('/upgrade')}>
              Upgrade Membership
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const prevLesson = getPrevLesson();
  const nextLesson = getNextLesson();
  const progressPercent = lessons.length > 0 
    ? Math.round((completedLessons.length / lessons.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Link
              to={`/academy/${course.slug}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">{course.title}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span>{progressPercent}% complete</span>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden"
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-card border-r border-border z-40 transform transition-transform lg:transform-none ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
            <span className="font-medium">Lessons</span>
            <button onClick={() => setShowSidebar(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto h-full pb-20">
            {lessons.map((l) => {
              const isActive = l.id === lesson.id;
              const isLessonCompleted = completedLessons.includes(l.id);

              return (
                <Link
                  key={l.id}
                  to={`/academy/${course.slug}/${l.slug}`}
                  onClick={() => setShowSidebar(false)}
                  className={`flex items-center gap-3 p-4 border-b border-border transition-colors ${
                    isActive 
                      ? 'bg-gold/10 border-l-2 border-l-gold' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isLessonCompleted 
                      ? 'bg-gold text-primary-dark' 
                      : isActive
                        ? 'bg-gold/20 text-gold'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isLessonCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-sm">{l.order_index}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-gold' : 'text-foreground'}`}>
                      {l.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{l.duration_minutes}min</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Video Player */}
            <VideoPlayer url={lesson.video_url} title={lesson.title} />

            {/* Lesson Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                  Lesson {lesson.order_index}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {lesson.duration_minutes} min
                </span>
              </div>

              <h1 className="font-heading text-2xl md:text-3xl text-foreground mb-4">
                {lesson.title}
              </h1>

              {lesson.description && (
                <p className="text-lg text-muted-foreground mb-8">
                  {lesson.description}
                </p>
              )}

              {/* Lesson Content */}
              {lesson.content && (
                <div className="prose prose-invert max-w-none mb-8">
                  <div 
                    className="text-foreground leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeMarkdownHtml(
                        lesson.content
                          .replace(/## (.*)/g, '<h2 class="font-heading text-xl text-foreground mt-8 mb-4">$1</h2>')
                          .replace(/### (.*)/g, '<h3 class="font-heading text-lg text-foreground mt-6 mb-3">$1</h3>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gold">$1</strong>')
                          .replace(/- (.*)/g, '<li class="text-muted-foreground ml-4">$1</li>')
                          .replace(/\n\n/g, '</p><p class="text-muted-foreground">')
                      )
                    }}
                  />
                </div>
              )}

              {/* Downloadable Resources */}
              {Array.isArray(lesson.resources) && lesson.resources.length > 0 && (
                <div className="mb-8">
                  <ResourceList resources={lesson.resources as Resource[]} />
                </div>
              )}

              {/* Mark Complete Button */}
              {user && (
                <div className="flex items-center gap-4 py-6 border-t border-border">
                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-gold">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Lesson completed</span>
                    </div>
                  ) : (
                    <Button variant="gold" onClick={markAsComplete}>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Mark as Complete
                    </Button>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between py-6 border-t border-border">
                {prevLesson ? (
                  <Link to={`/academy/${course.slug}/${prevLesson.slug}`}>
                    <Button variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}

                {nextLesson ? (
                  <Link to={`/academy/${course.slug}/${nextLesson.slug}`}>
                    <Button variant="gold">
                      Next Lesson
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/academy/${course.slug}`}>
                    <Button variant="gold">
                      Back to Course
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
