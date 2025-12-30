import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Archive
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OKRKeyResultRow } from './OKRKeyResultRow';
import { AddKeyResultDialog } from './AddKeyResultDialog';
import { RecordProgressDialog } from './RecordProgressDialog';
import type { OKRObjective, OKRKeyResult } from '@/hooks/useOKRs';

interface OKRObjectiveCardProps {
  objective: OKRObjective;
  onUpdate: (id: string, data: { status?: string }) => void;
  onDelete: (id: string) => void;
  onAddKeyResult: (data: { objective_id: string; title: string; target_value: number; unit: string; due_date?: string }) => void;
  onUpdateKeyResult: (data: { id: string; current_value?: number; status?: string }) => void;
  onDeleteKeyResult: (id: string) => void;
  onRecordProgress: (data: { key_result_id: string; previous_value: number; new_value: number; notes?: string }) => void;
}

export function OKRObjectiveCard({
  objective,
  onUpdate,
  onDelete,
  onAddKeyResult,
  onUpdateKeyResult,
  onDeleteKeyResult,
  onRecordProgress,
}: OKRObjectiveCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddKR, setShowAddKR] = useState(false);
  const [selectedKR, setSelectedKR] = useState<OKRKeyResult | null>(null);

  const keyResults = objective.key_results || [];
  const totalProgress = keyResults.length > 0
    ? keyResults.reduce((sum, kr) => sum + (kr.current_value / kr.target_value) * 100, 0) / keyResults.length
    : 0;

  const statusColors = {
    active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    archived: 'bg-muted text-muted-foreground border-muted',
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={statusColors[objective.status]}>
                  {objective.status}
                </Badge>
                <Badge variant="secondary">
                  {objective.quarter ? `${objective.timeframe} ${objective.quarter}` : objective.timeframe}
                </Badge>
              </div>
              <CardTitle className="text-lg">{objective.title}</CardTitle>
              {objective.description && (
                <p className="text-sm text-muted-foreground mt-1">{objective.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onUpdate(objective.id, { status: 'completed' })}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdate(objective.id, { status: 'archived' })}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(objective.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {keyResults.map((kr) => (
                <OKRKeyResultRow
                  key={kr.id}
                  keyResult={kr}
                  onRecordProgress={() => setSelectedKR(kr)}
                  onDelete={() => onDeleteKeyResult(kr.id)}
                />
              ))}
              
              {keyResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No key results yet. Add one to track progress.
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => setShowAddKR(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Key Result
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <AddKeyResultDialog
        open={showAddKR}
        onOpenChange={setShowAddKR}
        objectiveId={objective.id}
        onSubmit={onAddKeyResult}
      />

      {selectedKR && (
        <RecordProgressDialog
          open={!!selectedKR}
          onOpenChange={(open) => !open && setSelectedKR(null)}
          keyResult={selectedKR}
          onSubmit={onRecordProgress}
        />
      )}
    </>
  );
}
