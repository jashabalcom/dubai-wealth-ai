import { useState } from 'react';
import { Heart, MessageCircle, Crown, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

  const isElite = post.author?.membership_tier === 'elite';

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      {/* Author Header */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.author?.avatar_url || undefined} />
          <AvatarFallback className="bg-muted">
            {post.author?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{post.author?.full_name || 'Anonymous'}</span>
            {isElite && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs">
                <Crown className="h-3 w-3" />
                Elite
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <div>
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <button
          onClick={() => onLike(post.id, !!post.has_liked)}
          className={cn(
            "flex items-center gap-2 text-sm transition-colors",
            post.has_liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart className={cn("h-4 w-4", post.has_liked && "fill-current")} />
          {post.likes_count}
        </button>
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {post.comments_count} Comments
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 pt-4 border-t border-border">
          {loadingComments ? (
            <div className="text-center text-muted-foreground py-4">Loading comments...</div>
          ) : (
            <>
              {/* Comment List */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author?.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-xs">
                        {comment.author?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted rounded-lg p-3">
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
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Comment Input */}
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[60px] resize-none"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  size="icon"
                  className="h-auto"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
