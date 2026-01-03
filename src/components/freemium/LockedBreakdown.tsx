import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LockedBreakdownProps {
  message?: string;
  className?: string;
}

export function LockedBreakdown({ 
  message = 'Sign up to see breakdown',
  className 
}: LockedBreakdownProps) {
  return (
    <Link 
      to="/auth" 
      className={cn(
        'flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Lock className="w-3 h-3" />
      <span>{message}</span>
    </Link>
  );
}
