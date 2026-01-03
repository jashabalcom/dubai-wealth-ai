import { cn } from '@/lib/utils';

interface ProjectStatusTabsProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  counts?: Record<string, number>;
}

const statuses = [
  { value: 'all', label: 'All Projects' },
  { value: 'under_construction', label: 'Under Construction' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'iconic', label: 'Iconic' },
];

export function ProjectStatusTabs({ selectedStatus, onStatusChange, counts }: ProjectStatusTabsProps) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-1 -mx-1 px-1">
      {statuses.map((status) => {
        const count = counts?.[status.value] || 0;
        const isActive = selectedStatus === status.value;
        
        return (
          <button
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
              "border border-border hover:border-gold/50",
              isActive
                ? "bg-gold text-primary-foreground border-gold"
                : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {status.label}
            {counts && status.value !== 'all' && count > 0 && (
              <span className={cn(
                "ml-2 text-xs",
                isActive ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
