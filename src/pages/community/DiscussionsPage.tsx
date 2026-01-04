import { useEffect, useCallback, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Hash, MessageSquarePlus } from 'lucide-react';
import { ChannelList } from '@/components/community/ChannelList';
import { PostCard } from '@/components/community/PostCard';
import { InlinePostComposer } from '@/components/community/InlinePostComposer';
import { CategoryFilterPills } from '@/components/community/CategoryFilterPills';
import { CommunityInfoCard } from '@/components/community/CommunityInfoCard';
import { PageTransition } from '@/components/community/PageTransition';
import { ReadOnlyBadge } from '@/components/freemium/ReadOnlyBadge';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { SidebarCard } from '@/components/community/SidebarCard';
import { SortingTabs, SortOption, sortPosts } from '@/components/community/SortingTabs';
import { useCommunity } from '@/hooks/useCommunity';
import { useProfile } from '@/hooks/useProfile';
import { COMMUNITY_LAYOUT } from '@/lib/designTokens';

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
  const { profile } = useProfile();
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const canParticipate = profile?.membership_tier === 'investor' || profile?.membership_tier === 'elite';
  
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
    refetchPosts,
  } = useCommunity();

  const handleRefresh = useCallback(async () => {
    await refetchPosts();
  }, [refetchPosts]);

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId, setSelectedChannelId]);

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  // Sort posts: pinned first, then by selected sort option
  const sortedPosts = useMemo(() => {
    const pinnedPosts = posts.filter(p => p.is_pinned);
    const unpinnedPosts = posts.filter(p => !p.is_pinned);
    const sortedUnpinned = sortPosts(unpinnedPosts, sortBy);
    return [...pinnedPosts, ...sortedUnpinned];
  }, [posts, sortBy]);

  return (
    <PageTransition>
      {/* Read-only banner for free users */}
      {!canParticipate && (
        <ReadOnlyBadge message="Upgrade to post, comment, and engage with the community" />
      )}
      
      <div className={COMMUNITY_LAYOUT.grid.container}>
        {/* Left Sidebar - Channel List (Desktop only) */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className={`hidden lg:block ${COMMUNITY_LAYOUT.grid.leftSidebar}`}
        >
          <SidebarCard>
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
          </SidebarCard>
        </motion.aside>

        {/* Main Content - Posts */}
        <div className={`${COMMUNITY_LAYOUT.grid.mainContent} ${COMMUNITY_LAYOUT.spacing.content}`}>
          <PullToRefresh onRefresh={handleRefresh} disabled={postsLoading}>
            {/* Mobile Category Filter Pills */}
            <div className="lg:hidden">
              {!channelsLoading && (
                <CategoryFilterPills
                  channels={channels}
                  selectedChannelId={selectedChannelId}
                  onSelectChannel={setSelectedChannelId}
                />
              )}
            </div>

            {/* Channel Header (Desktop) */}
            {selectedChannel && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:flex items-center gap-3 bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl p-4"
              >
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
              </motion.div>
            )}

            {/* Sorting Tabs */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <SortingTabs value={sortBy} onChange={setSortBy} />
            </div>

            {/* Inline Post Composer */}
            <InlinePostComposer
              onSubmit={(title, content, images, postType, videoUrl, pollData, gifUrl, mentionedUserIds) => 
                createPost.mutate({ title, content, images, postType, videoUrl, pollData, gifUrl, mentionedUserIds })
              }
              isSubmitting={createPost.isPending}
              canPost={canParticipate}
            />

            {/* Posts */}
            {postsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-card/90 border border-border/40 rounded-3xl p-5 animate-pulse"
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
            ) : sortedPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-center py-12 ${COMMUNITY_LAYOUT.card.base} ${COMMUNITY_LAYOUT.card.padding}`}
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
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {sortedPosts.map((post) => (
                  <motion.div key={post.id} variants={itemVariants}>
                    <PostCard
                      post={post}
                      onLike={(postId, hasLiked) => toggleLike.mutate({ postId, hasLiked })}
                      onComment={(postId, content) => addComment.mutate({ postId, content })}
                      getComments={getPostComments}
                      canInteract={canParticipate}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </PullToRefresh>
        </div>

        {/* Right Sidebar - Community Info (Desktop only) */}
        <aside className={`hidden lg:block ${COMMUNITY_LAYOUT.grid.rightSidebar}`}>
          <div className={COMMUNITY_LAYOUT.sidebar.sticky}>
            <CommunityInfoCard />
          </div>
        </aside>
      </div>
    </PageTransition>
  );
}