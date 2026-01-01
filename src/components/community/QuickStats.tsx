import { Users, UserPlus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickStatsProps {
  totalMembers: number;
  onlineCount?: number;
  newThisWeek?: number;
}

export function QuickStats({ 
  totalMembers, 
  onlineCount = 0, 
  newThisWeek = 0 
}: QuickStatsProps) {
  const stats = [
    {
      icon: Users,
      label: 'Total Members',
      value: totalMembers.toLocaleString(),
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      icon: Sparkles,
      label: 'Online Now',
      value: onlineCount.toLocaleString(),
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: UserPlus,
      label: 'New This Week',
      value: newThisWeek.toLocaleString(),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Quick Stats
      </h3>
      <div className="space-y-2">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-gold/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <span className="font-semibold tabular-nums">{stat.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
