import { cn } from '@/lib/utils';
import { COMMUNITY_LAYOUT } from '@/lib/designTokens';

interface SidebarCardProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
  withGradient?: boolean;
}

export function SidebarCard({ 
  children, 
  className,
  sticky = true,
  withGradient = true,
}: SidebarCardProps) {
  return (
    <div 
      className={cn(
        COMMUNITY_LAYOUT.sidebar.container,
        sticky && COMMUNITY_LAYOUT.sidebar.sticky,
        className
      )}
    >
      {withGradient && (
        <div className={COMMUNITY_LAYOUT.card.gradient} />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
