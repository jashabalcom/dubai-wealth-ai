import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface OKRStatsCardsProps {
  stats: {
    totalObjectives: number;
    onTrack: number;
    atRisk: number;
    behind: number;
    completed: number;
    totalKeyResults: number;
  };
}

export function OKRStatsCards({ stats }: OKRStatsCardsProps) {
  const onTrackPercent = stats.totalKeyResults > 0 
    ? Math.round(((stats.onTrack + stats.completed) / stats.totalKeyResults) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalObjectives}</p>
              <p className="text-xs text-muted-foreground">Active Objectives</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.onTrack}</p>
              <p className="text-xs text-muted-foreground">On Track</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.atRisk}</p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.behind}</p>
              <p className="text-xs text-muted-foreground">Behind</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{onTrackPercent}%</p>
              <p className="text-xs text-muted-foreground">Health Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
