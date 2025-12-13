import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ReadOnlyBadgeProps {
  message?: string;
  compact?: boolean;
}

export function ReadOnlyBadge({ message, compact }: ReadOnlyBadgeProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
        <Eye className="h-3 w-3" />
        <span>View Only</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 border border-border rounded-lg mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-muted rounded-full">
          <Eye className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Preview Mode</p>
          <p className="text-xs text-muted-foreground">
            {message || 'Upgrade to participate in discussions'}
          </p>
        </div>
      </div>
      <Button asChild size="sm" variant="outline">
        <Link to="/pricing">Upgrade</Link>
      </Button>
    </div>
  );
}
