import { Building2, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type PropertyStatus = 'all' | 'ready' | 'off_plan';

interface PropertyStatusTabsProps {
  value: PropertyStatus;
  onChange: (status: PropertyStatus) => void;
  counts: {
    all: number;
    ready: number;
    off_plan: number;
  };
}

export function PropertyStatusTabs({ value, onChange, counts }: PropertyStatusTabsProps) {
  const tabs = [
    {
      id: 'all' as const,
      label: 'All Properties',
      icon: Building2,
      count: counts.all,
    },
    {
      id: 'ready' as const,
      label: 'Ready to Move',
      icon: Check,
      count: counts.ready,
    },
    {
      id: 'off_plan' as const,
      label: 'Off-Plan',
      icon: Clock,
      count: counts.off_plan,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = value === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
              "border min-h-[44px]",
              isActive
                ? "bg-gold text-navy border-gold shadow-md shadow-gold/20"
                : "bg-card text-muted-foreground border-border hover:border-gold/50 hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span className={cn(
              "ml-1 px-2 py-0.5 rounded-full text-xs font-semibold",
              isActive
                ? "bg-navy/20 text-navy"
                : "bg-muted text-muted-foreground"
            )}>
              {tab.count.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
