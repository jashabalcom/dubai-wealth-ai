import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type ReportReason = 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'inappropriate_content' | 'scam' | 'other';

export interface ContentReport {
  id: string;
  reporter_id: string | null;
  content_type: 'post' | 'comment';
  post_id: string | null;
  comment_id: string | null;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  reporter?: { full_name: string | null; avatar_url: string | null };
  post?: { title: string; content: string; user_id: string };
  comment?: { content: string; user_id: string };
}

interface ReportFilters {
  status?: ReportStatus;
  contentType?: 'post' | 'comment';
  reason?: ReportReason;
}

export function useContentReports(filters?: ReportFilters) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch reports (admin only via RLS)
  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['content-reports', filters],
    queryFn: async () => {
      let query = supabase
        .from('content_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.contentType) {
        query = query.eq('content_type', filters.contentType);
      }
      if (filters?.reason) {
        query = query.eq('reason', filters.reason);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch related data
      const enrichedReports = await Promise.all(
        (data || []).map(async (report) => {
          const enriched: ContentReport = { ...report } as ContentReport;

          // Get reporter profile
          if (report.reporter_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', report.reporter_id)
              .single();
            enriched.reporter = profile || undefined;
          }

          // Get post data
          if (report.post_id) {
            const { data: post } = await supabase
              .from('community_posts')
              .select('title, content, user_id')
              .eq('id', report.post_id)
              .single();
            enriched.post = post || undefined;
          }

          // Get comment data
          if (report.comment_id) {
            const { data: comment } = await supabase
              .from('community_comments')
              .select('content, user_id')
              .eq('id', report.comment_id)
              .single();
            enriched.comment = comment || undefined;
          }

          return enriched;
        })
      );

      return enrichedReports;
    },
    enabled: !!user,
  });

  // Get report stats
  const { data: stats } = useQuery({
    queryKey: ['content-reports-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_reports')
        .select('status');
      
      if (error) throw error;

      const pending = data?.filter(r => r.status === 'pending').length || 0;
      const reviewed = data?.filter(r => r.status === 'reviewed').length || 0;
      const resolved = data?.filter(r => r.status === 'resolved').length || 0;
      const dismissed = data?.filter(r => r.status === 'dismissed').length || 0;

      return { pending, reviewed, resolved, dismissed, total: data?.length || 0 };
    },
    enabled: !!user,
  });

  // Create a report
  const createReport = useMutation({
    mutationFn: async ({
      contentType,
      postId,
      commentId,
      reason,
      details,
    }: {
      contentType: 'post' | 'comment';
      postId?: string;
      commentId?: string;
      reason: ReportReason;
      details?: string;
    }) => {
      if (!user) throw new Error('Must be logged in to report content');

      const { error } = await supabase.from('content_reports').insert({
        reporter_id: user.id,
        content_type: contentType,
        post_id: postId || null,
        comment_id: commentId || null,
        reason,
        details: details || null,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already reported this content');
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Report submitted', {
        description: 'Thank you for helping keep our community safe.',
      });
      queryClient.invalidateQueries({ queryKey: ['content-reports'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to submit report', {
        description: error.message,
      });
    },
  });

  // Update report status
  const updateReportStatus = useMutation({
    mutationFn: async ({
      reportId,
      status,
      resolutionNotes,
    }: {
      reportId: string;
      status: ReportStatus;
      resolutionNotes?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('content_reports')
        .update({
          status,
          resolution_notes: resolutionNotes || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Report updated');
      queryClient.invalidateQueries({ queryKey: ['content-reports'] });
    },
    onError: () => {
      toast.error('Failed to update report');
    },
  });

  // Delete reported content and resolve report
  const deleteReportedContent = useMutation({
    mutationFn: async (report: ContentReport) => {
      if (!user) throw new Error('Must be logged in');

      // Delete the content
      if (report.content_type === 'post' && report.post_id) {
        const { error } = await supabase
          .from('community_posts')
          .delete()
          .eq('id', report.post_id);
        if (error) throw error;
      } else if (report.content_type === 'comment' && report.comment_id) {
        const { error } = await supabase
          .from('community_comments')
          .delete()
          .eq('id', report.comment_id);
        if (error) throw error;
      }

      // Mark report as resolved
      const { error } = await supabase
        .from('content_reports')
        .update({
          status: 'resolved',
          resolution_notes: 'Content removed by moderator',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', report.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Content removed and report resolved');
      queryClient.invalidateQueries({ queryKey: ['content-reports'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: () => {
      toast.error('Failed to remove content');
    },
  });

  return {
    reports,
    isLoading,
    stats,
    refetch,
    createReport: createReport.mutate,
    isCreating: createReport.isPending,
    updateReportStatus: updateReportStatus.mutate,
    isUpdating: updateReportStatus.isPending,
    deleteReportedContent: deleteReportedContent.mutate,
    isDeleting: deleteReportedContent.isPending,
  };
}
