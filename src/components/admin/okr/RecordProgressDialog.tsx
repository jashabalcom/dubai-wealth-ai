import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import type { OKRKeyResult } from '@/hooks/useOKRs';

interface RecordProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyResult: OKRKeyResult;
  onSubmit: (data: { key_result_id: string; previous_value: number; new_value: number; notes?: string }) => void;
}

export function RecordProgressDialog({ open, onOpenChange, keyResult, onSubmit }: RecordProgressDialogProps) {
  const [newValue, setNewValue] = useState(keyResult.current_value.toString());
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue) return;

    onSubmit({
      key_result_id: keyResult.id,
      previous_value: keyResult.current_value,
      new_value: parseFloat(newValue),
      notes: notes.trim() || undefined,
    });

    setNotes('');
    onOpenChange(false);
  };

  const currentProgress = (keyResult.current_value / keyResult.target_value) * 100;
  const newProgress = newValue ? (parseFloat(newValue) / keyResult.target_value) * 100 : currentProgress;

  const formatValue = (value: number) => {
    if (keyResult.unit === 'percent') return `${value}%`;
    if (keyResult.unit === 'currency') return `AED ${value.toLocaleString()}`;
    return value.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Progress</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-2">{keyResult.title}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Current: {formatValue(keyResult.current_value)}</span>
              <span>Target: {formatValue(keyResult.target_value)}</span>
            </div>
            <Progress value={currentProgress} className="h-1.5" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-value">New Value</Label>
            <Input
              id="new-value"
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={keyResult.current_value.toString()}
              required
            />
            {newValue && parseFloat(newValue) !== keyResult.current_value && (
              <div className="text-xs text-muted-foreground">
                Progress will be {Math.round(newProgress)}% ({newProgress > currentProgress ? '+' : ''}{Math.round(newProgress - currentProgress)}% change)
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What drove this progress? Any blockers?"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Progress</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
