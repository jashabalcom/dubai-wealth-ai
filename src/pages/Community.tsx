import { useEffect } from 'react';
import { Users, Hash } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ChannelList } from '@/components/community/ChannelList';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostDialog } from '@/components/community/CreatePostDialog';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function Community() {
  const { user, loading: authLoading } = useAuth();
  const {
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
  } = useCommunity();

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId, setSelectedChannelId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <Users className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Community</h1>
              <p className="text-muted-foreground">
                Connect with fellow Dubai investors
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Channel List */}
          <aside className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4 sticky top-24">
              {channelsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <ChannelList
                  channels={channels}
                  selectedChannelId={selectedChannelId}
                  onSelectChannel={setSelectedChannelId}
                />
              )}
            </div>
          </aside>

          {/* Main Content - Posts */}
          <div className="lg:col-span-3 space-y-6">
            {/* Channel Header */}
            {selectedChannel && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-gold" />
                  <h2 className="text-xl font-semibold">{selectedChannel.name}</h2>
                </div>
                <CreatePostDialog
                  onSubmit={(title, content) => createPost.mutate({ title, content })}
                  isSubmitting={createPost.isPending}
                />
              </div>
            )}

            {selectedChannel?.description && (
              <p className="text-muted-foreground bg-muted/50 rounded-lg p-3">
                {selectedChannel.description}
              </p>
            )}

            {/* Posts */}
            {postsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 bg-muted rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-5 w-3/4 bg-muted rounded" />
                      <div className="h-4 w-full bg-muted rounded" />
                      <div className="h-4 w-2/3 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  Be the first to start a conversation in this channel!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={(postId, hasLiked) => toggleLike.mutate({ postId, hasLiked })}
                    onComment={(postId, content) => addComment.mutate({ postId, content })}
                    getComments={getPostComments}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
