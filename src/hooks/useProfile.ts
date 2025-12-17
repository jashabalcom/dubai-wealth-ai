import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  budget_range: string | null;
  timeline: string | null;
  investment_goal: string | null;
  bio?: string | null;
  looking_for?: string | null;
  linkedin_url?: string | null;
  membership_tier: 'free' | 'investor' | 'elite';
  membership_status?: 'active' | 'canceled' | 'trial' | 'expired';
  membership_renews_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface UserPost {
  id: string;
  title: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  channel: {
    name: string;
    slug: string;
  };
}

export interface UserComment {
  id: string;
  content: string;
  created_at: string;
  post: {
    id: string;
    title: string;
  };
}

export function useProfile(userId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;
  const isOwnProfile = user?.id === targetUserId;

  // Fetch profile - use direct query for own profile, secure function for others
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      
      // If viewing own profile, query directly (RLS allows this)
      if (isOwnProfile) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .maybeSingle();
        if (error) throw error;
        return data as Profile | null;
      }
      
      // For other users, use secure function that only returns safe columns
      const { data, error } = await supabase.rpc('get_public_profile', {
        profile_id: targetUserId
      });

      if (error) throw error;
      // The function returns an array, get first item
      const profileData = Array.isArray(data) ? data[0] : data;
      return profileData as Profile | null;
    },
    enabled: !!targetUserId,
  });

  // Fetch user's posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          id,
          title,
          content,
          likes_count,
          comments_count,
          created_at,
          channel:community_channels(name, slug)
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(post => ({
        ...post,
        channel: Array.isArray(post.channel) ? post.channel[0] : post.channel
      })) as UserPost[];
    },
    enabled: !!targetUserId,
  });

  // Fetch user's comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['user-comments', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          id,
          content,
          created_at,
          post:community_posts(id, title)
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(comment => ({
        ...comment,
        post: Array.isArray(comment.post) ? comment.post[0] : comment.post
      })) as UserComment[];
    },
    enabled: !!targetUserId,
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    },
  });

  // Upload avatar mutation
  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Avatar updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload avatar: ' + error.message);
    },
  });

  return {
    profile,
    posts,
    comments,
    profileLoading,
    postsLoading,
    commentsLoading,
    updateProfile,
    uploadAvatar,
    isOwnProfile,
  };
}