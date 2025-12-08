import { useEffect, useState } from 'react';
import { Users, Hash, MessageSquarePlus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ChannelList } from '@/components/community/ChannelList';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostDialog } from '@/components/community/CreatePostDialog';
import { EventsTab } from '@/components/community/EventsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Community() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('discussions');
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
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      
      <main className="flex-1 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between mb-10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 shadow-lg shadow-gold/10">
                <Users className="h-7 w-7 text-gold" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-foreground via-foreground to-gold bg-clip-text text-transparent">
                  Community
                </h1>
                <p className="text-muted-foreground mt-1">
                  Connect with fellow Dubai investors
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TabsList className="mb-8 bg-card/50 border border-border/50 p-1">
                <TabsTrigger value="discussions" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  <MessageSquarePlus className="h-4 w-4" />
                  Discussions
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  <Calendar className="h-4 w-4" />
                  Events
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="discussions">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar - Channel List */}
                <motion.aside
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-1"
                >
                  <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5 sticky top-24 shadow-xl shadow-black/5">
                    <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent rounded-2xl pointer-events-none" />
                    <div className="relative z-10">
                      {channelsLoading ? (
                        <div className="space-y-3">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="h-11 bg-muted/50 rounded-lg animate-pulse"
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
                <div className="lg:col-span-3 space-y-6">
                  {/* Channel Header */}
                  {selectedChannel && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="flex items-center justify-between bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gold/10">
                          <Hash className="h-5 w-5 text-gold" />
                        </div>
                        <div>
                          <h2 className="text-xl font-serif font-semibold">{selectedChannel.name}</h2>
                          {selectedChannel.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
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
                    <div className="space-y-5">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-card border border-border/50 rounded-2xl p-6 shadow-lg shadow-black/5"
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div className="h-12 w-12 bg-muted/50 rounded-full animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-4 w-28 bg-muted/50 rounded animate-pulse" />
                              <div className="h-3 w-20 bg-muted/50 rounded animate-pulse" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="h-6 w-3/4 bg-muted/50 rounded animate-pulse" />
                            <div className="h-4 w-full bg-muted/50 rounded animate-pulse" />
                            <div className="h-4 w-2/3 bg-muted/50 rounded animate-pulse" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : posts.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center py-16 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl shadow-black/5"
                    >
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl" />
                        <div className="relative p-4 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20">
                          <MessageSquarePlus className="h-10 w-10 text-gold" />
                        </div>
                      </div>
                      <h3 className="text-xl font-serif font-semibold mb-2">No posts yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
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
                      className="space-y-5"
                    >
                      {posts.map((post, index) => (
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
            </TabsContent>

            <TabsContent value="events">
              <EventsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}