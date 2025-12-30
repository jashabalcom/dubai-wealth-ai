import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { OKRKeyResult } from '@/hooks/useOKRs';

interface OKRKeyResultRowProps {
  keyResult: OKRKeyResult;
  onRecordProgress: () => void;
  onDelete: () => void;
}

export function OKRKeyResultRow({ keyResult, onRecordProgress, onDelete }: OKRKeyResultRowProps) {
  const progress = (keyResult.current_value / keyResult.target_value) * 100;
  
  const statusColors = {
    on_track: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    at_risk: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    behind: 'bg-red-500/10 text-red-600 border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  };

  const progressColors = {
    on_track: 'bg-emerald-500',
    at_risk: 'bg-amber-500',
    behind: 'bg-red-500',
    completed: 'bg-blue-500',
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'percent') return `${value}%`;
    if (unit === 'currency') return `AED ${value.toLocaleString()}`;
    return value.toLocaleString();
  };

  return (
    <div className="p-3 rounded-lg border bg-card/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`text-xs ${statusColors[keyResult.status]}`}>
              {keyResult.status.replace('_', ' ')}
            </Badge>
            {keyResult.due_date && (
              <span className="text-xs text-muted-foreground">
                Due {format(new Date(keyResult.due_date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
          <p className="text-sm font-medium truncate">{keyResult.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div 
                className={`h-full transition-all ${progressColors[keyResult.status]}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatValue(keyResult.current_value, keyResult.unit)} / {formatValue(keyResult.target_value, keyResult.unit)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRecordProgress}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Update
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
