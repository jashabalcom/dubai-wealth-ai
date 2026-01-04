import { useState } from 'react';
import { Flag, Eye, Trash2, X, CheckCircle, Clock, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useContentReports, ContentReport, ReportStatus, ReportReason } from '@/hooks/useContentReports';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  reviewed: { label: 'Reviewed', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Eye },
  resolved: { label: 'Resolved', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: 'bg-muted text-muted-foreground border-border', icon: X },
};

const REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam',
  harassment: 'Harassment',
  hate_speech: 'Hate Speech',
  misinformation: 'Misinformation',
  inappropriate_content: 'Inappropriate',
  scam: 'Scam',
  other: 'Other',
};

export default function AdminModeration() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('pending');
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { reports, isLoading, stats, updateReportStatus, isUpdating, deleteReportedContent, isDeleting } = useContentReports(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );

  const handleUpdateStatus = (status: ReportStatus) => {
    if (!selectedReport) return;
    updateReportStatus(
      { reportId: selectedReport.id, status, resolutionNotes: resolutionNotes.trim() || undefined },
      { onSuccess: () => { setSelectedReport(null); setResolutionNotes(''); } }
    );
  };

  const handleDeleteContent = () => {
    if (!selectedReport) return;
    deleteReportedContent(selectedReport, {
      onSuccess: () => {
        setSelectedReport(null);
        setShowDeleteConfirm(false);
        setResolutionNotes('');
      },
    });
  };

  return (
    <AdminLayout title="Content Moderation">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
          <div className="text-sm text-muted-foreground">Total Reports</div>
        </div>
        <div className="bg-card border border-yellow-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-500">{stats?.pending || 0}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="bg-card border border-blue-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-500">{stats?.reviewed || 0}</div>
          <div className="text-sm text-muted-foreground">Reviewed</div>
        </div>
        <div className="bg-card border border-green-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-500">{stats?.resolved || 0}</div>
          <div className="text-sm text-muted-foreground">Resolved</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-2xl font-bold text-muted-foreground">{stats?.dismissed || 0}</div>
          <div className="text-sm text-muted-foreground">Dismissed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by status:</span>
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReportStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Flag className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No reports found</p>
            <p className="text-sm text-muted-foreground/70">
              {statusFilter === 'pending' ? 'No pending reports to review' : 'Try changing your filters'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const statusConfig = STATUS_CONFIG[report.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {report.content_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
                        {REASON_LABELS[report.reason]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate text-sm">
                        {report.post?.title || report.comment?.content || 'Content unavailable'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{report.reporter?.full_name || 'Unknown'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('gap-1', statusConfig.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedReport && !showDeleteConfirm} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-destructive" />
              Review Report
            </DialogTitle>
            <DialogDescription>
              Review the reported content and take appropriate action.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 py-4">
              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>{' '}
                  <Badge variant="outline" className="capitalize ml-1">{selectedReport.content_type}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Reason:</span>{' '}
                  <Badge variant="secondary" className="bg-destructive/10 text-destructive ml-1">
                    {REASON_LABELS[selectedReport.reason]}
                  </Badge>
                </div>
              </div>

              {/* Reported Content */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Reported Content:</span>
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  {selectedReport.post ? (
                    <div>
                      <p className="font-medium">{selectedReport.post.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {selectedReport.post.content}
                      </p>
                    </div>
                  ) : selectedReport.comment ? (
                    <p className="text-sm">{selectedReport.comment.content}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Content no longer available</p>
                  )}
                </div>
              </div>

              {/* Reporter Details */}
              {selectedReport.details && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Reporter's Notes:</span>
                  <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                    {selectedReport.details}
                  </p>
                </div>
              )}

              {/* Resolution Notes */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Resolution Notes (optional):</span>
                <Textarea
                  placeholder="Add notes about your decision..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => handleUpdateStatus('dismissed')} disabled={isUpdating}>
              <X className="h-4 w-4 mr-1" />
              Dismiss
            </Button>
            <Button variant="outline" onClick={() => handleUpdateStatus('reviewed')} disabled={isUpdating}>
              <Eye className="h-4 w-4 mr-1" />
              Mark Reviewed
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isUpdating || !selectedReport?.post && !selectedReport?.comment}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirm Content Removal</DialogTitle>
            <DialogDescription>
              This will permanently delete the {selectedReport?.content_type} and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteContent} disabled={isDeleting}>
              {isDeleting ? 'Removing...' : 'Remove Content'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
