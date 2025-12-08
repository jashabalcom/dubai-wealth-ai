import { useState } from 'react';
import { Heart, MessageCircle, Crown, Send, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Author {
  full_name: string | null;
  avatar_url: string | null;
  membership_tier: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author?: Author;
}

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    author?: Author;
    has_liked?: boolean;
  };
  onLike: (postId: string, hasLiked: boolean) => void;
  onComment: (postId: string, content: string) => void;
  getComments: (postId: string) => Promise<Comment[]>;
}

export function PostCard({ post, onLike, onComment, getComments }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

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
    if (!newComment.trim()) return;
    await onComment(post.id, newComment);
    setNewComment('');
    // Refresh comments
    const fetchedComments = await getComments(post.id);
    setComments(fetchedComments);
  };

  const handleLike = () => {
    setIsLiking(true);
    onLike(post.id, !!post.has_liked);
    setTimeout(() => setIsLiking(false), 300);
  };

  const isElite = post.author?.membership_tier === 'elite';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-5 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-shadow duration-300"
    >
      {/* Author Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className={cn(
            "h-12 w-12 ring-2 ring-offset-2 ring-offset-card transition-all",
            isElite ? "ring-gold/50" : "ring-border/50"
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
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{post.author?.full_name || 'Anonymous'}</span>
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
      </div>

      {/* Post Content */}
      <div className="space-y-2">
        <h3 className="text-xl font-serif font-semibold leading-tight">{post.title}</h3>
        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {/* Decorative Divider */}
      <div className="relative h-px w-full bg-border/50">
        <div className="absolute left-0 top-0 w-12 h-px bg-gradient-to-r from-gold/50 to-transparent" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <motion.button
          onClick={handleLike}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors group",
            post.has_liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
          )}
        >
          <motion.div
            animate={isLiking ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Heart className={cn(
              "h-5 w-5 transition-all",
              post.has_liked && "fill-current",
              "group-hover:scale-110"
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
                            <div className="flex items-center gap-2 mb-1">
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}