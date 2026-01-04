import { useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useContentReports, ReportReason } from '@/hooks/useContentReports';

interface ReportContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'post' | 'comment';
  postId?: string;
  commentId?: string;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: 'spam', label: 'Spam', description: 'Promotional or repetitive content' },
  { value: 'harassment', label: 'Harassment', description: 'Targeting or intimidating a user' },
  { value: 'hate_speech', label: 'Hate Speech', description: 'Attacks on identity or beliefs' },
  { value: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
  { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Offensive or explicit material' },
  { value: 'scam', label: 'Scam / Fraud', description: 'Deceptive or fraudulent activity' },
  { value: 'other', label: 'Other', description: 'Another reason not listed' },
];

export function ReportContentDialog({
  open,
  onOpenChange,
  contentType,
  postId,
  commentId,
}: ReportContentDialogProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const { createReport, isCreating } = useContentReports();

  const handleSubmit = () => {
    if (!reason) return;

    createReport(
      {
        contentType,
        postId,
        commentId,
        reason,
        details: details.trim() || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReason('');
          setDetails('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report {contentType === 'post' ? 'Post' : 'Comment'}
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe community by reporting content that violates our guidelines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex flex-col">
                      <span>{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              placeholder="Provide any additional context that may help our moderation team..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
            <AlertTriangle className="h-4 w-4 text-gold mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Reports are confidential. The content author will not know who reported their content.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || isCreating}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isCreating ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
