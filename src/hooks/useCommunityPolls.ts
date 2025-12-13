import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface CreatePollData {
  postId: string;
  question: string;
  options: string[];
}

export function useCommunityPolls() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createPoll = useMutation({
    mutationFn: async ({ postId, question, options }: CreatePollData) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('community_polls')
        .insert({
          post_id: postId,
          question,
          options: options,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: (error) => {
      toast.error('Failed to create poll: ' + error.message);
    },
  });

  const votePoll = useMutation({
    mutationFn: async ({ pollId, optionIndex }: { pollId: string; optionIndex: number }) => {
      if (!user) throw new Error('Not authenticated');

      // Check if already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        throw new Error('Already voted');
      }

      const { error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_id: user.id,
          option_index: optionIndex,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });

  const getPollForPost = async (postId: string) => {
    const { data, error } = await supabase
      .from('community_polls')
      .select('*')
      .eq('post_id', postId)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  return {
    createPoll,
    votePoll,
    getPollForPost,
  };
}
