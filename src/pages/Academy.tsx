import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, BookOpen, BarChart3, Star, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SEOHead } from '@/components/SEOHead';
import { PAGE_SEO } from '@/lib/seo-config';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  category: string;
  thumbnail_url: string;
  duration_minutes: number;
  is_featured: boolean;
}

interface CourseProgress {
  course_id: string;
  completed_lessons: number;
  total_lessons: number;
}

const categories = [
  'All',
  'Dubai Basics',
  'Off-Plan',
  'Short-Term Rentals',
  'Golden Visa',
  'Portfolio Strategy',
  'Area Analysis',
  'Due Diligence',
];

const levelColors: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-400',
  intermediate: 'bg-blue-500/20 text-blue-400',
  advanced: 'bg-purple-500/20 text-purple-400',
};

export default function Academy() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('order_index');

    if (!error && data) {
      setCourses(data);
    }
    setLoading(false);
  };

  const fetchProgress = async () => {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, course_id');

    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('lesson_id, is_completed')
      .eq('is_completed', true);

    if (lessons && progressData) {
      const courseProgressMap: Record<string, { completed: number; total: number }> = {};
      
      lessons.forEach((lesson) => {
        if (!courseProgressMap[lesson.course_id]) {
          courseProgressMap[lesson.course_id] = { completed: 0, total: 0 };
        }
        courseProgressMap[lesson.course_id].total++;
        
        if (progressData.find((p) => p.lesson_id === lesson.id)) {
          courseProgressMap[lesson.course_id].completed++;
        }
      });

      setProgress(
        Object.entries(courseProgressMap).map(([course_id, { completed, total }]) => ({
          course_id,
          completed_lessons: completed,
          total_lessons: total,
        }))
      );
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCourseProgress = (courseId: string) => {
    const courseProgress = progress.find((p) => p.course_id === courseId);
    if (!courseProgress || courseProgress.total_lessons === 0) return 0;
    return Math.round((courseProgress.completed_lessons / courseProgress.total_lessons) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...PAGE_SEO.academy} />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Dubai Real Estate <span className="text-gradient-gold">Academy</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Master Dubai real estate investing with expert-led courses designed for global investors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'gold' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap min-h-[40px] shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => {
                const progressPercent = getCourseProgress(course.id);
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      to={`/academy/${course.slug}`}
                      className="group block h-full"
                    >
                      <div className="h-full rounded-2xl bg-card border border-border overflow-hidden hover:border-gold/30 transition-all duration-300 hover:shadow-xl hover:shadow-gold/5">
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={course.thumbnail_url || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {course.is_featured && (
                            <div className="absolute top-3 left-3 px-2 py-1 bg-gold text-primary-dark text-xs font-medium rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Featured
                            </div>
                          )}
                          {user && progressPercent > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                              <div
                                className="h-full bg-gold transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${levelColors[course.level] || levelColors.beginner}`}>
                              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">{course.category}</span>
                          </div>

                          <h3 className="font-heading text-xl text-foreground mb-2 group-hover:text-gold transition-colors line-clamp-2">
                            {course.title}
                          </h3>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {course.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {Math.round(course.duration_minutes / 60)}h {course.duration_minutes % 60}m
                            </span>
                            {user && progressPercent > 0 && (
                              <span className="flex items-center gap-1 text-gold">
                                <BarChart3 className="w-4 h-4" />
                                {progressPercent}% complete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
