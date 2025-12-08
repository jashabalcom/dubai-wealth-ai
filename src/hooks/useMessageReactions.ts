import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export function useMessageReactions(messageIds: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch reactions for all messages
  const { data: reactions = [] } = useQuery({
    queryKey: ['message-reactions', messageIds],
    queryFn: async () => {
      if (messageIds.length === 0) return [];

      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .in('message_id', messageIds);

      if (error) throw error;
      return data as Reaction[];
    },
    enabled: messageIds.length > 0,
  });

  // Group reactions by message
  const getReactionsForMessage = (messageId: string): ReactionGroup[] => {
    const messageReactions = reactions.filter(r => r.message_id === messageId);
    const emojiMap = new Map<string, { count: number; userReacted: boolean }>();

    messageReactions.forEach(reaction => {
      const existing = emojiMap.get(reaction.emoji) || { count: 0, userReacted: false };
      emojiMap.set(reaction.emoji, {
        count: existing.count + 1,
        userReacted: existing.userReacted || reaction.user_id === user?.id,
      });
    });

    return Array.from(emojiMap.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      userReacted: data.userReacted,
    }));
  };

  // Toggle reaction mutation
  const toggleReaction = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check if reaction exists
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        // Remove reaction
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions'] });
    },
  });

  return {
    reactions,
    getReactionsForMessage,
    toggleReaction,
  };
}
