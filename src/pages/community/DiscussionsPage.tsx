import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hash, MessageSquarePlus } from 'lucide-react';
import { ChannelList } from '@/components/community/ChannelList';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostDialog } from '@/components/community/CreatePostDialog';
import { PageTransition } from '@/components/community/PageTransition';
import { useCommunity } from '@/hooks/useCommunity';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function DiscussionsPage() {
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

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  return (
    <PageTransition>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Channel List */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="lg:col-span-1"
      >
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 sticky top-28 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent rounded-2xl pointer-events-none" />
          <div className="relative z-10">
            {channelsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-muted/50 rounded-lg animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
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
        </div>
      </motion.aside>

      {/* Main Content - Posts */}
      <div className="lg:col-span-3 space-y-5">
        {/* Channel Header */}
        {selectedChannel && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <Hash className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-semibold">{selectedChannel.name}</h2>
                {selectedChannel.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedChannel.description}
                  </p>
                )}
              </div>
            </div>
            <CreatePostDialog
              onSubmit={(title, content, images) => createPost.mutate({ title, content, images })}
              isSubmitting={createPost.isPending}
            />
          </motion.div>
        )}

        {/* Posts */}
        {postsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border/50 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 bg-muted/50 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-muted/50 rounded" />
                    <div className="h-3 w-20 bg-muted/50 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-muted/50 rounded" />
                  <div className="h-4 w-full bg-muted/50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl"
          >
            <div className="relative inline-block mb-5">
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl" />
              <div className="relative p-4 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20">
                <MessageSquarePlus className="h-8 w-8 text-gold" />
              </div>
            </div>
            <h3 className="text-lg font-serif font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-5 max-w-sm mx-auto text-sm">
              Be the first to start a conversation in this channel!
            </p>
            <CreatePostDialog
              onSubmit={(title, content, images) => createPost.mutate({ title, content, images })}
              isSubmitting={createPost.isPending}
            />
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {posts.map((post) => (
              <motion.div key={post.id} variants={itemVariants}>
                <PostCard
                  post={post}
                  onLike={(postId, hasLiked) => toggleLike.mutate({ postId, hasLiked })}
                  onComment={(postId, content) => addComment.mutate({ postId, content })}
                  getComments={getPostComments}
                />
              </motion.div>
            ))}
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
