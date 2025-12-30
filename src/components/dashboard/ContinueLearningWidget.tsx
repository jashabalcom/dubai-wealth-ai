import { motion } from 'framer-motion';
import { Play, GraduationCap, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLearningProgress } from '@/hooks/useLearningProgress';

export function ContinueLearningWidget() {
  const navigate = useNavigate();
  const { data: progress, isLoading } = useLearningProgress();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="w-24 h-16 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // No progress yet - show start learning CTA
  if (!progress?.lastLesson) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-heading text-base text-foreground">Start Learning</h3>
            <p className="text-xs text-muted-foreground">Begin your investment journey</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Access expert courses on Dubai real estate, from market fundamentals to advanced strategies.
        </p>

        <Button 
          onClick={() => navigate('/academy')}
          className="w-full gap-2"
          variant="default"
        >
          Browse Courses
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  const progressPercent = progress.lastLesson.duration > 0 
    ? Math.round((progress.lastLesson.position / progress.lastLesson.duration) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl bg-card border border-border hover:border-border/80 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="font-heading text-base text-foreground">Continue Learning</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/academy')} className="text-xs">
          View All
        </Button>
      </div>

      <button
        onClick={() => navigate(`/academy/${progress.lastLesson?.courseSlug}/${progress.lastLesson?.slug}`)}
        className="w-full flex gap-3 group text-left"
      >
        {/* Thumbnail with play overlay */}
        <div className="relative w-24 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
          {progress.currentCourse?.thumbnailUrl ? (
            <img 
              src={progress.currentCourse.thumbnailUrl} 
              alt={progress.currentCourse.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-4 h-4 text-black fill-black ml-0.5" />
            </div>
          </div>
          
          {/* Progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-blue-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-blue-500 transition-colors">
            {progress.lastLesson.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {progress.currentCourse?.title}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Resume at {formatTime(progress.lastLesson.position)}
            </span>
          </div>
        </div>
      </button>

      {/* Overall progress */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Overall Progress</span>
          <span>{progress.progressPercent}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.progressPercent}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
