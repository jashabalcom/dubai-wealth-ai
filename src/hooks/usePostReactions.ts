import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface ReactionGroup {
  emoji: string;
  count: number;
  hasReacted: boolean;
  users: string[];
}

export function usePostReactions(postIds: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all reactions for given posts
  const { data: reactions = [] } = useQuery({
    queryKey: ['post-reactions', postIds],
    queryFn: async () => {
      if (postIds.length === 0) return [];

      const { data, error } = await supabase
        .from('post_reactions')
        .select('*')
        .in('post_id', postIds);

      if (error) throw error;
      return data as Reaction[];
    },
    enabled: postIds.length > 0,
  });

  // Group reactions by post and emoji
  const getReactionsForPost = (postId: string): ReactionGroup[] => {
    const postReactions = reactions.filter(r => r.post_id === postId);
    
    const emojiGroups = new Map<string, { count: number; hasReacted: boolean; users: string[] }>();
    
    postReactions.forEach(reaction => {
      const existing = emojiGroups.get(reaction.emoji);
      if (existing) {
        existing.count++;
        if (reaction.user_id === user?.id) existing.hasReacted = true;
        existing.users.push(reaction.user_id);
      } else {
        emojiGroups.set(reaction.emoji, {
          count: 1,
          hasReacted: reaction.user_id === user?.id,
          users: [reaction.user_id],
        });
      }
    });

    return Array.from(emojiGroups.entries()).map(([emoji, data]) => ({
      emoji,
      ...data,
    }));
  };

  // Toggle reaction
  const toggleReaction = useMutation({
    mutationFn: async ({ postId, emoji }: { postId: string; emoji: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Check if reaction exists
      const { data: existing } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .maybeSingle();

      if (existing) {
        // Remove reaction
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            emoji,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reactions', postIds] });
    },
  });

  return {
    reactions,
    getReactionsForPost,
    toggleReaction: toggleReaction.mutate,
  };
}