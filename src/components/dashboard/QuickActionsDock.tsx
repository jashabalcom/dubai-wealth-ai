import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Building2, 
  TrendingUp, 
  Users, 
  Brain,
  Heart,
  CalendarDays,
  Briefcase,
  Lock
} from 'lucide-react';

interface QuickActionsDockProps {
  isElite: boolean;
  isPrivate: boolean;
}

export function QuickActionsDock({ isElite, isPrivate }: QuickActionsDockProps) {
  const navigate = useNavigate();
  const hasPortfolio = isElite || isPrivate;

  const actions = [
    { icon: GraduationCap, label: 'Academy', href: '/academy', color: 'text-blue-500 bg-blue-500/10' },
    { icon: Building2, label: 'Properties', href: '/properties', color: 'text-emerald-500 bg-emerald-500/10' },
    { icon: TrendingUp, label: 'Tools', href: '/tools', color: 'text-purple-500 bg-purple-500/10' },
    { icon: Users, label: 'Community', href: '/community', color: 'text-orange-500 bg-orange-500/10' },
    { icon: Brain, label: 'AI', href: '/ai', color: 'text-pink-500 bg-pink-500/10' },
    { icon: Heart, label: 'Saved', href: '/properties/saved', color: 'text-rose-500 bg-rose-500/10' },
    { icon: CalendarDays, label: 'Calendar', href: '/calendar', color: 'text-gold bg-gold/10' },
    { 
      icon: hasPortfolio ? Briefcase : Lock, 
      label: 'Portfolio', 
      href: hasPortfolio ? '/portfolio' : '/upgrade',
      color: hasPortfolio ? 'text-amber-500 bg-amber-500/10' : 'text-muted-foreground bg-muted',
      locked: !hasPortfolio
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-card border border-border"
    >
      <h3 className="font-heading text-sm text-muted-foreground mb-3 px-1">Quick Actions</h3>
      
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            onClick={() => navigate(action.href)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors group relative ${
              action.locked ? 'opacity-60' : ''
            }`}
          >
            <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">{action.label}</span>
            
            {action.locked && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center">
                <Lock className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
