import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: 'all_members' | 'elite_only';
  order_index: number;
}

interface Post {
  id: string;
  channel_id: string;
  user_id: string;
  title: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
    membership_tier: string;
  };
  has_liked?: boolean;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
    membership_tier: string;
  };
}

export function useCommunity() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['community-channels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_channels')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data as Channel[];
    },
    enabled: !!user,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['community-posts', selectedChannelId],
    queryFn: async () => {
      if (!selectedChannelId) return [];
      
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('channel_id', selectedChannelId)
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;

      // Fetch author info and like status for each post
      const postsWithAuthors = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, membership_tier')
            .eq('id', post.user_id)
            .maybeSingle();

          let hasLiked = false;
          if (user) {
            const { data: like } = await supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle();
            hasLiked = !!like;
          }

          return {
            ...post,
            author: profile,
            has_liked: hasLiked,
          };
        })
      );

      return postsWithAuthors as Post[];
    },
    enabled: !!selectedChannelId && !!user,
  });

  const createPost = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (!user || !selectedChannelId) throw new Error('Not authenticated or no channel selected');
      
      const { error } = await supabase
        .from('community_posts')
        .insert({
          channel_id: selectedChannelId,
          user_id: user.id,
          title,
          content,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts', selectedChannelId] });
      toast.success('Post created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create post: ' + error.message);
    },
  });

  const toggleLike = useMutation({
    mutationFn: async ({ postId, hasLiked }: { postId: string; hasLiked: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      
      if (hasLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
        
        await supabase
          .from('community_posts')
          .update({ likes_count: supabase.rpc as any })
          .eq('id', postId);
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts', selectedChannelId] });
    },
  });

  const getPostComments = async (postId: string): Promise<Comment[]> => {
    const { data: commentsData, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at');
    
    if (error) throw error;

    const commentsWithAuthors = await Promise.all(
      (commentsData || []).map(async (comment) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, membership_tier')
          .eq('id', comment.user_id)
          .maybeSingle();

        return {
          ...comment,
          author: profile,
        };
      })
    );

    return commentsWithAuthors as Comment[];
  };

  const addComment = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        });
      
      if (error) throw error;

      // Update comments count
      const { data: post } = await supabase
        .from('community_posts')
        .select('comments_count')
        .eq('id', postId)
        .single();
      
      if (post) {
        await supabase
          .from('community_posts')
          .update({ comments_count: post.comments_count + 1 })
          .eq('id', postId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts', selectedChannelId] });
      toast.success('Comment added');
    },
  });

  return {
    channels,
    channelsLoading,
    posts,
    postsLoading,
    selectedChannelId,
    setSelectedChannelId,
    createPost,
    toggleLike,
    getPostComments,
    addComment,
  };
}
