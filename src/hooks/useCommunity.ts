import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { sendNotification } from '@/lib/notifications';

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
  images?: string[];
  is_pinned?: boolean;
  post_type?: string;
  video_url?: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
    membership_tier: string;
    level?: number;
    points?: number;
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

interface CreatePostData {
  title: string;
  content: string;
  images: File[];
  postType?: string;
  videoUrl?: string;
  gifUrl?: string;
  pollData?: { question: string; options: string[] };
  mentionedUserIds?: string[];
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

  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['community-posts', selectedChannelId],
    queryFn: async () => {
      if (!selectedChannelId) return [];
      
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('channel_id', selectedChannelId)
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;
      if (!postsData || postsData.length === 0) return [];

      // Batch fetch: collect unique user IDs
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      
      // Single query for all author profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, membership_tier, level, points')
        .in('id', userIds);
      
      // Create lookup map for O(1) access
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Single query for all user's likes in this batch
      let likedPostIds = new Set<string>();
      if (user) {
        const postIds = postsData.map(p => p.id);
        const { data: userLikes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        
        likedPostIds = new Set(userLikes?.map(l => l.post_id) || []);
      }

      // Map profiles and likes back to posts efficiently
      const postsWithAuthors = postsData.map(post => ({
        ...post,
        author: profileMap.get(post.user_id) || null,
        has_liked: likedPostIds.has(post.id),
      }));

      return postsWithAuthors as Post[];
    },
    enabled: !!selectedChannelId && !!user,
  });

  const createPost = useMutation({
    mutationFn: async ({ title, content, images, postType, videoUrl, gifUrl, pollData, mentionedUserIds }: CreatePostData) => {
      if (!user || !selectedChannelId) throw new Error('Not authenticated or no channel selected');
      
      // Upload images if any
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileName = `${user.id}/${Date.now()}-${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, image);
        
        if (uploadError) {
          console.error('Image upload error:', uploadError);
          continue;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);
        
        imageUrls.push(publicUrl);
      }
      
      // Create the post
      const { data: newPost, error } = await supabase
        .from('community_posts')
        .insert({
          channel_id: selectedChannelId,
          user_id: user.id,
          title,
          content,
          images: imageUrls,
          post_type: postType || 'discussion',
          video_url: videoUrl || null,
          gif_url: gifUrl || null,
        })
        .select()
        .single();
      
      if (error) throw error;

      // Create poll if poll data provided
      if (pollData && newPost) {
        const { error: pollError } = await supabase
          .from('community_polls')
          .insert({
            post_id: newPost.id,
            question: pollData.question,
            options: pollData.options,
          });
        
        if (pollError) {
          console.error('Poll creation error:', pollError);
        }
      }

      return newPost;
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
    if (!commentsData || commentsData.length === 0) return [];

    // Batch fetch: collect unique user IDs from comments
    const userIds = [...new Set(commentsData.map(c => c.user_id))];
    
    // Single query for all commenter profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, membership_tier')
      .in('id', userIds);
    
    // Create lookup map for O(1) access
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Map profiles back to comments efficiently
    const commentsWithAuthors = commentsData.map(comment => ({
      ...comment,
      author: profileMap.get(comment.user_id) || null,
    }));

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

      // Get post info to find author and update count
      const { data: post } = await supabase
        .from('community_posts')
        .select('user_id, title, comments_count')
        .eq('id', postId)
        .single();
      
      if (post) {
        await supabase
          .from('community_posts')
          .update({ comments_count: post.comments_count + 1 })
          .eq('id', postId);

        return { postAuthorId: post.user_id, postTitle: post.title };
      }

      return { postAuthorId: null, postTitle: null };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['community-posts', selectedChannelId] });
      toast.success('Comment added');

      // Send notification to post author (if not commenting on own post)
      if (data?.postAuthorId && data.postAuthorId !== user?.id) {
        const { data: commenterProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user?.id)
          .single();

        await sendNotification({
          userId: data.postAuthorId,
          type: 'post_comment',
          title: `${commenterProfile?.full_name || 'Someone'} commented on your post`,
          body: data.postTitle || 'Your post received a new comment',
          link: '/community',
          metadata: { commenter_id: user?.id },
        });
      }
    },
  });

  // Subscribe to realtime updates for posts and comments
  useEffect(() => {
    if (!selectedChannelId || !user) return;

    const postsChannel = supabase
      .channel('community-posts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts',
          filter: `channel_id=eq.${selectedChannelId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['community-posts', selectedChannelId] });
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel('community-comments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_comments',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['community-posts', selectedChannelId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [selectedChannelId, user, queryClient]);

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
    refetchPosts,
  };
}
