import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { sendNotification } from '@/lib/notifications';

export function useMentions() {
  const { user } = useAuth();

  // Process mentions and create notifications
  const processMentions = useMutation({
    mutationFn: async ({
      content,
      postId,
      commentId,
      authorName,
    }: {
      content: string;
      postId?: string;
      commentId?: string;
      authorName?: string;
    }) => {
      if (!user) return;

      // Extract mentions from content
      const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
      const mentions: { name: string; userId: string }[] = [];
      let match;
      
      while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push({
          name: match[1],
          userId: match[2],
        });
      }

      if (mentions.length === 0) return;

      // Create mention records and send notifications
      for (const mention of mentions) {
        // Don't notify yourself
        if (mention.userId === user.id) continue;

        // Insert mention record
        await supabase
          .from('post_mentions')
          .insert({
            post_id: postId || null,
            comment_id: commentId || null,
            mentioned_user_id: mention.userId,
          });

        // Send notification
        await sendNotification({
          userId: mention.userId,
          type: 'mention',
          title: `${authorName || 'Someone'} mentioned you`,
          body: postId 
            ? 'You were mentioned in a post' 
            : 'You were mentioned in a comment',
          link: '/community',
          metadata: { 
            mentioner_id: user.id,
            post_id: postId,
            comment_id: commentId,
          },
        });
      }

      return mentions;
    },
  });

  return {
    processMentions: processMentions.mutate,
    isProcessing: processMentions.isPending,
  };
}