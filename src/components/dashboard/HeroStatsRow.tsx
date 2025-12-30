import { motion } from 'framer-motion';
import { GraduationCap, Heart, Briefcase, CalendarDays, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { useUpcomingEvents } from '@/hooks/useCalendarEvents';

interface HeroStatsRowProps {
  isPaidMember: boolean;
  isElite: boolean;
}

export function HeroStatsRow({ isPaidMember, isElite }: HeroStatsRowProps) {
  const navigate = useNavigate();
  const { data: learningProgress, isLoading: learningLoading } = useLearningProgress();
  const { savedPropertyIds, isLoading: savedLoading } = useSavedProperties();
  const { data: events, isLoading: eventsLoading } = useUpcomingEvents(7);

  // Upcoming events this week
  const upcomingEvents = events || [];

  const savedCount = savedPropertyIds?.length || 0;
  const eventsCount = upcomingEvents.length;
  const progressPercent = learningProgress?.progressPercent || 0;

  const stats = [
    {
      icon: GraduationCap,
      label: 'Learning Progress',
      value: `${progressPercent}%`,
      subtext: `${learningProgress?.completedLessons || 0} lessons completed`,
      color: 'from-blue-500/20 to-blue-600/10',
      iconColor: 'text-blue-500',
      href: '/academy',
      isLoading: learningLoading,
      showProgress: true,
      progress: learningProgress?.progressPercent || 0,
    },
    {
      icon: Heart,
      label: 'Saved Properties',
      value: savedCount.toString(),
      subtext: 'Properties saved',
      color: 'from-rose-500/20 to-rose-600/10',
      iconColor: 'text-rose-500',
      href: '/properties/saved',
      isLoading: savedLoading,
    },
    {
      icon: Briefcase,
      label: 'Portfolio',
      value: isElite ? 'Active' : 'Locked',
      subtext: isElite ? 'Track your investments' : 'Upgrade to Elite',
      color: 'from-amber-500/20 to-amber-600/10',
      iconColor: 'text-amber-500',
      href: isElite ? '/portfolio' : '/upgrade',
      locked: !isElite,
    },
    {
      icon: CalendarDays,
      label: 'This Week',
      value: eventsCount.toString(),
      subtext: upcomingEvents[0]?.title || 'No upcoming events',
      color: 'from-emerald-500/20 to-emerald-600/10',
      iconColor: 'text-emerald-500',
      href: '/calendar',
      isLoading: eventsLoading,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <motion.button
          key={stat.label}
          onClick={() => navigate(stat.href)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative group p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${stat.color} border border-border/50 hover:border-border transition-all duration-300 text-left overflow-hidden`}
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center mb-3 ${stat.iconColor}`}>
              <stat.icon className="w-5 h-5" />
            </div>

            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{stat.label}</p>
            
            {stat.isLoading ? (
              <div className="h-8 w-16 bg-muted/50 rounded animate-pulse" />
            ) : (
              <p className={`text-2xl sm:text-3xl font-heading font-bold ${stat.locked ? 'text-muted-foreground' : 'text-foreground'}`}>
                {stat.value}
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{stat.subtext}</p>

            {/* Progress bar for learning */}
            {stat.showProgress && !stat.isLoading && (
              <div className="mt-3 h-1.5 bg-background/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            )}

            {/* Locked overlay */}
            {stat.locked && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  Unlock <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
