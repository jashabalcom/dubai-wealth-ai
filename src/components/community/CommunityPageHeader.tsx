import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  count?: number;
  actions?: React.ReactNode;
  className?: string;
}

export function CommunityPageHeader({
  title,
  subtitle,
  icon: Icon,
  count,
  actions,
  className,
}: CommunityPageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20">
            <Icon className="h-5 w-5 text-gold" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
            {title}
            {typeof count === 'number' && (
              <span className="text-sm font-normal text-muted-foreground">
                ({count.toLocaleString()})
              </span>
            )}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
