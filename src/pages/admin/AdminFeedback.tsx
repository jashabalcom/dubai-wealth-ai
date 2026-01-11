import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Bug, Lightbulb, MessageCircle, BookOpen, Palette, 
  Star, ExternalLink, Check, X, Clock, AlertCircle,
  ChevronDown, Filter, RefreshCw
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FeedbackStatus = 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'wont_fix';
type FeedbackCategory = 'bug' | 'feature' | 'general' | 'content' | 'ux';

interface Feedback {
  id: string;
  user_id: string | null;
  category: FeedbackCategory;
  rating: number | null;
  title: string;
  description: string;
  page_url: string | null;
  user_agent: string | null;
  status: FeedbackStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const categoryIcons: Record<FeedbackCategory, React.ReactNode> = {
  bug: <Bug className="h-4 w-4" />,
  feature: <Lightbulb className="h-4 w-4" />,
  general: <MessageCircle className="h-4 w-4" />,
  content: <BookOpen className="h-4 w-4" />,
  ux: <Palette className="h-4 w-4" />,
};

const categoryColors: Record<FeedbackCategory, string> = {
  bug: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  feature: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  content: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  ux: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const statusColors: Record<FeedbackStatus, string> = {
  new: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  wont_fix: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const statusLabels: Record<FeedbackStatus, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  wont_fix: "Won't Fix",
};

export default function AdminFeedback() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | 'all'>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data: feedback = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-feedback', statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Feedback[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: FeedbackStatus; notes?: string }) => {
      const updateData: Record<string, unknown> = { status };
      if (notes !== undefined) {
        updateData.admin_notes = notes;
      }
      if (status !== 'new') {
        updateData.reviewed_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('user_feedback')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast.success('Feedback updated');
      setSelectedFeedback(null);
    },
    onError: (error) => {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback');
    },
  });

  const stats = {
    total: feedback.length,
    new: feedback.filter(f => f.status === 'new').length,
    inProgress: feedback.filter(f => f.status === 'in_progress').length,
    resolved: feedback.filter(f => f.status === 'resolved').length,
  };

  const handleStatusChange = (id: string, status: FeedbackStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleSaveNotes = () => {
    if (!selectedFeedback) return;
    updateStatusMutation.mutate({ 
      id: selectedFeedback.id, 
      status: selectedFeedback.status,
      notes: adminNotes 
    });
  };

  return (
    <AdminLayout title="User Feedback">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" /> New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" /> In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" /> Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FeedbackStatus | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="wont_fix">Won't Fix</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as FeedbackCategory | 'all')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="ux">UX/Design</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Feedback List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading feedback...</div>
      ) : feedback.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No feedback found. Users can submit feedback via the widget.
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <Card 
              key={item.id} 
              className={cn(
                "cursor-pointer hover:border-primary/50 transition-colors",
                item.status === 'new' && "border-l-4 border-l-yellow-500"
              )}
              onClick={() => {
                setSelectedFeedback(item);
                setAdminNotes(item.admin_notes || '');
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={categoryColors[item.category]} variant="secondary">
                        {categoryIcons[item.category]}
                        <span className="ml-1 capitalize">{item.category}</span>
                      </Badge>
                      <Badge className={statusColors[item.status]} variant="secondary">
                        {statusLabels[item.status]}
                      </Badge>
                      {item.rating && (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-3 w-3",
                                star <= item.rating!
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}</span>
                      {item.page_url && (
                        <a 
                          href={item.page_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Page
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'reviewed')}>
                        Mark as Reviewed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'in_progress')}>
                        Mark In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'resolved')}>
                        Mark Resolved
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'wont_fix')}>
                        Won't Fix
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedFeedback?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={categoryColors[selectedFeedback.category]} variant="secondary">
                  {categoryIcons[selectedFeedback.category]}
                  <span className="ml-1 capitalize">{selectedFeedback.category}</span>
                </Badge>
                <Select 
                  value={selectedFeedback.status} 
                  onValueChange={(v) => handleStatusChange(selectedFeedback.id, v as FeedbackStatus)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="wont_fix">Won't Fix</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedFeedback.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground mr-2">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        star <= selectedFeedback.rating!
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-foreground whitespace-pre-wrap">{selectedFeedback.description}</p>
              </div>

              {selectedFeedback.page_url && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Page URL</h4>
                  <a 
                    href={selectedFeedback.page_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {selectedFeedback.page_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Submitted</h4>
                <p className="text-sm">{format(new Date(selectedFeedback.created_at), 'MMMM d, yyyy h:mm a')}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Admin Notes</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this feedback..."
                  rows={3}
                />
                <Button 
                  size="sm" 
                  className="mt-2" 
                  onClick={handleSaveNotes}
                  disabled={updateStatusMutation.isPending}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
