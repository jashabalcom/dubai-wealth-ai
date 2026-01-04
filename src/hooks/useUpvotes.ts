import { useCallback } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PostVote {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

interface CommentVote {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export function usePostUpvotes(postIds: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: votes = [], isLoading } = useQuery({
    queryKey: ['post_votes', postIds],
    queryFn: async () => {
      if (!postIds.length) return [];
      const { data, error } = await supabase
        .from('post_votes')
        .select('*')
        .in('post_id', postIds);
      
      if (error) throw error;
      return data as PostVote[];
    },
    enabled: postIds.length > 0,
  });

  const hasVoted = useCallback((postId: string) => {
    if (!user) return false;
    return votes.some(v => v.post_id === postId && v.user_id === user.id);
  }, [votes, user]);

  const getVoteCount = useCallback((postId: string) => {
    return votes.filter(v => v.post_id === postId).length;
  }, [votes]);

  const toggleVoteMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Must be logged in to vote');
      
      const userVote = votes.find(v => v.post_id === postId && v.user_id === user.id);

      if (userVote) {
        const { error } = await supabase
          .from('post_votes')
          .delete()
          .eq('id', userVote.id);
        if (error) throw error;
        return { action: 'removed' };
      } else {
        const { error } = await supabase
          .from('post_votes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });
        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post_votes', postIds] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: (error) => {
      console.error('Vote error:', error);
      toast.error('Failed to update vote');
    },
  });

  return {
    votes,
    isLoading,
    hasVoted,
    getVoteCount,
    toggleVote: toggleVoteMutation.mutate,
    isVoting: toggleVoteMutation.isPending,
  };
}

export function useCommentUpvotes(commentIds: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: votes = [], isLoading } = useQuery({
    queryKey: ['comment_votes', commentIds],
    queryFn: async () => {
      if (!commentIds.length) return [];
      const { data, error } = await supabase
        .from('comment_votes')
        .select('*')
        .in('comment_id', commentIds);
      
      if (error) throw error;
      return data as CommentVote[];
    },
    enabled: commentIds.length > 0,
  });

  const hasVoted = useCallback((commentId: string) => {
    if (!user) return false;
    return votes.some(v => v.comment_id === commentId && v.user_id === user.id);
  }, [votes, user]);

  const getVoteCount = useCallback((commentId: string) => {
    return votes.filter(v => v.comment_id === commentId).length;
  }, [votes]);

  const toggleVoteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error('Must be logged in to vote');
      
      const userVote = votes.find(v => v.comment_id === commentId && v.user_id === user.id);

      if (userVote) {
        const { error } = await supabase
          .from('comment_votes')
          .delete()
          .eq('id', userVote.id);
        if (error) throw error;
        return { action: 'removed' };
      } else {
        const { error } = await supabase
          .from('comment_votes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });
        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment_votes', commentIds] });
    },
    onError: (error) => {
      console.error('Vote error:', error);
      toast.error('Failed to update vote');
    },
  });

  return {
    votes,
    isLoading,
    hasVoted,
    getVoteCount,
    toggleVote: toggleVoteMutation.mutate,
    isVoting: toggleVoteMutation.isPending,
  };
}

// Simplified hook for single post upvote
export function useSinglePostUpvote(postId: string) {
  const { hasVoted, toggleVote, isVoting, getVoteCount } = usePostUpvotes([postId]);
  
  return {
    hasUpvoted: hasVoted(postId),
    upvoteCount: getVoteCount(postId),
    toggleUpvote: () => toggleVote(postId),
    isVoting,
  };
}

// Simplified hook for single comment upvote  
export function useSingleCommentUpvote(commentId: string) {
  const { hasVoted, toggleVote, isVoting, getVoteCount } = useCommentUpvotes([commentId]);
  
  return {
    hasUpvoted: hasVoted(commentId),
    upvoteCount: getVoteCount(commentId),
    toggleUpvote: () => toggleVote(commentId),
    isVoting,
  };
}
