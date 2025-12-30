import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn('flex items-center gap-1.5 text-sm', className)}
    >
      <Link 
        to="/" 
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            {isLast || !item.href ? (
              <span 
                className={cn(
                  'max-w-[200px] truncate',
                  isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            ) : (
              <Link 
                to={item.href}
                className="max-w-[200px] truncate text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
