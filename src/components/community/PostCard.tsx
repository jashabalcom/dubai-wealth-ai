import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Crown, Send, ChevronDown, Pin, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MemberLevelBadge } from '@/components/community/MemberLevelBadge';
import { PollDisplay } from '@/components/community/PollDisplay';
import { VideoEmbed } from '@/components/community/VideoEmbed';
import { PostReactions } from '@/components/community/PostReactions';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/useAdmin';
import { usePostReactions } from '@/hooks/usePostReactions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Author {
  full_name: string | null;
  avatar_url: string | null;
  membership_tier: string;
  level?: number;
  points?: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author?: Author;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
}

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    user_id?: string;
    author?: Author;
    has_liked?: boolean;
    images?: string[];
    is_pinned?: boolean;
    post_type?: string;
    video_url?: string;
    gif_url?: string;
  };
  onLike: (postId: string, hasLiked: boolean) => void;
  onComment: (postId: string, content: string) => void;
  getComments: (postId: string) => Promise<Comment[]>;
  canInteract?: boolean;
  onPinToggle?: () => void;
}

export function PostCard({ post, onLike, onComment, getComments, canInteract = true, onPinToggle }: PostCardProps) {
  const { isAdmin } = useAdmin();
  const { getReactionsForPost, toggleReaction } = usePostReactions([post.id]);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [poll, setPoll] = useState<Poll | null>(null);

  const postReactions = getReactionsForPost(post.id);

  // Fetch poll if post type is poll
  useEffect(() => {
    if (post.post_type === 'poll') {
      fetchPoll();
    }
  }, [post.id, post.post_type]);

  const fetchPoll = async () => {
    const { data } = await supabase
      .from('community_polls')
      .select('*')
      .eq('post_id', post.id)
      .maybeSingle();
    
    if (data) {
      setPoll({
        id: data.id,
        question: data.question,
        options: Array.isArray(data.options) ? data.options as string[] : [],
      });
    }
  };

  const handleToggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const fetchedComments = await getComments(post.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Failed to load comments:', error);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !canInteract) return;
    await onComment(post.id, newComment);
    setNewComment('');
    const fetchedComments = await getComments(post.id);
    setComments(fetchedComments);
  };

  const handleLike = () => {
    if (!canInteract) return;
    setIsLiking(true);
    onLike(post.id, !!post.has_liked);
    setTimeout(() => setIsLiking(false), 300);
  };

  const handlePin = async () => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ 
          is_pinned: !post.is_pinned,
          pinned_at: !post.is_pinned ? new Date().toISOString() : null
        })
        .eq('id', post.id);
      
      if (error) throw error;
      toast.success(post.is_pinned ? 'Post unpinned' : 'Post pinned');
      onPinToggle?.();
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      toast.error('Failed to update pin status');
    }
  };

  const isElite = post.author?.membership_tier === 'elite';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-card/80 backdrop-blur-sm border rounded-2xl p-6 space-y-5 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-shadow duration-300",
        post.is_pinned ? "border-gold/30 ring-1 ring-gold/10" : "border-border/50"
      )}
    >
      {/* Pinned Indicator */}
      {post.is_pinned && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium"
        >
          <Pin className="h-3 w-3" />
          Pinned
        </motion.div>
      )}

      {/* Author Header */}
      <div className="flex items-center gap-4">
        <Link to={post.user_id ? `/profile/${post.user_id}` : '#'} className="relative group">
          <Avatar className={cn(
            "h-12 w-12 ring-2 ring-offset-2 ring-offset-card transition-all",
            isElite ? "ring-gold/50" : "ring-border/50",
            post.user_id && "group-hover:ring-gold/70"
          )}>
            <AvatarImage src={post.author?.avatar_url || undefined} />
            <AvatarFallback className={cn(
              "text-sm font-medium",
              isElite ? "bg-gold/20 text-gold" : "bg-muted"
            )}>
              {post.author?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {isElite && (
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-card border border-gold/30 shadow-lg shadow-gold/20">
              <Crown className="h-3 w-3 text-gold" />
            </div>
          )}
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link 
              to={post.user_id ? `/profile/${post.user_id}` : '#'} 
              className="font-semibold hover:text-gold transition-colors"
            >
              {post.author?.full_name || 'Anonymous'}
            </Link>
            {post.author?.level && post.author.level > 1 && (
              <MemberLevelBadge level={post.author.level} size="sm" />
            )}
            {isElite && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-gold/20 to-gold/10 text-gold text-xs font-medium border border-gold/20"
              >
                Elite
              </motion.span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
        
        {/* Admin Menu */}
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePin}>
                <Pin className="h-4 w-4 mr-2" />
                {post.is_pinned ? 'Unpin Post' : 'Pin Post'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        <h3 className="text-xl font-serif font-semibold leading-tight">{post.title}</h3>
        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
        
        {/* Video Embed */}
        {post.post_type === 'video' && post.video_url && (
          <VideoEmbed url={post.video_url} />
        )}

        {/* GIF Display */}
        {post.post_type === 'gif' && post.gif_url && (
          <img 
            src={post.gif_url} 
            alt="GIF" 
            className="max-w-full rounded-xl"
          />
        )}
        
        {/* Poll Display */}
        {post.post_type === 'poll' && poll && (
          <PollDisplay
            pollId={poll.id}
            question={poll.question}
            options={poll.options}
          />
        )}
        
        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className={cn(
            "grid gap-2 pt-2",
            post.images.length === 1 && "grid-cols-1",
            post.images.length === 2 && "grid-cols-2",
            post.images.length >= 3 && "grid-cols-2"
          )}>
            {post.images.map((imageUrl, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative overflow-hidden rounded-xl bg-muted",
                  post.images!.length === 1 && "aspect-video",
                  post.images!.length === 2 && "aspect-square",
                  post.images!.length >= 3 && index === 0 && "row-span-2 aspect-[3/4]",
                  post.images!.length >= 3 && index > 0 && "aspect-square"
                )}
              >
                <img
                  src={imageUrl}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Decorative Divider */}
      <div className="relative h-px w-full bg-border/50">
        <div className="absolute left-0 top-0 w-12 h-px bg-gradient-to-r from-gold/50 to-transparent" />
      </div>

      {/* Reactions */}
      <div className="group">
        <PostReactions
          reactions={postReactions}
          onToggleReaction={(emoji) => toggleReaction({ postId: post.id, emoji })}
          disabled={!canInteract}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <motion.button
          onClick={handleLike}
          whileTap={{ scale: 0.9 }}
          disabled={!canInteract}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors group",
            post.has_liked ? "text-red-500" : "text-muted-foreground hover:text-red-500",
            !canInteract && "opacity-50 cursor-not-allowed"
          )}
        >
          <motion.div
            animate={isLiking ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart className={cn(
              "h-5 w-5 transition-all",
              post.has_liked && "fill-current",
              canInteract && "group-hover:scale-110"
            )} />
          </motion.div>
          <span>{post.likes_count}</span>
        </motion.button>
        
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span>{post.comments_count}</span>
          <motion.div
            animate={{ rotate: showComments ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4 border-t border-border/50">
              {loadingComments ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Comment List */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.05 } }
                    }}
                    className="space-y-3"
                  >
                    {comments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        No comments yet. Be the first to comment!
                      </p>
                    ) : (
                      comments.map((comment) => (
                        <motion.div
                          key={comment.id}
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          className="flex gap-3"
                        >
                          <Avatar className={cn(
                            "h-8 w-8 ring-1 ring-offset-1 ring-offset-card",
                            comment.author?.membership_tier === 'elite' ? "ring-gold/30" : "ring-border/30"
                          )}>
                            <AvatarImage src={comment.author?.avatar_url || undefined} />
                            <AvatarFallback className="bg-muted text-xs">
                              {comment.author?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-muted/50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-sm">
                                {comment.author?.full_name || 'Anonymous'}
                              </span>
                              {comment.author?.membership_tier === 'elite' && (
                                <Crown className="h-3 w-3 text-gold" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{comment.content}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>

                  {/* New Comment Input */}
                  {canInteract ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-3 pt-2"
                    >
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="min-h-[70px] resize-none bg-muted/30 border-border/50 focus:border-gold/50 focus:ring-gold/20 rounded-xl"
                      />
                      <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim()}
                        size="icon"
                        className="h-auto min-h-[70px] px-4 bg-gold hover:bg-gold/90 text-background rounded-xl transition-all hover:scale-105"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-2">
                      Upgrade to comment on posts
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
