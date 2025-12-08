import { Link, Navigate } from 'react-router-dom';
import { Users, UserCheck, Clock, Send, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectionCard } from '@/components/community/ConnectionCard';
import { useConnections } from '@/hooks/useConnections';
import { useAuth } from '@/hooks/useAuth';

export default function Connections() {
  const { user, loading: authLoading } = useAuth();
  const {
    acceptedConnections,
    acceptedLoading,
    pendingRequests,
    pendingLoading,
    sentRequests,
    sentLoading,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    removeConnection,
  } = useConnections();

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

  const isLoading = acceptRequest.isPending || rejectRequest.isPending || 
                    cancelRequest.isPending || removeConnection.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      
      <main className="flex-1 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/members">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Members
              </Link>
            </Button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 shadow-lg shadow-gold/10">
              <Users className="h-7 w-7 text-gold" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-foreground via-foreground to-gold bg-clip-text text-transparent">
                My Connections
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your network of Dubai investors
              </p>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="connections" className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TabsList className="mb-8 bg-card/50 border border-border/50 p-1">
                <TabsTrigger value="connections" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  <UserCheck className="h-4 w-4" />
                  Connections
                  {acceptedConnections.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-gold/20 text-gold text-xs">
                      {acceptedConnections.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="requests" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  <Clock className="h-4 w-4" />
                  Requests
                  {pendingRequests.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-destructive/20 text-destructive text-xs">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="sent" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  <Send className="h-4 w-4" />
                  Sent
                  {sentRequests.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-muted text-muted-foreground text-xs">
                      {sentRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* My Connections Tab */}
            <TabsContent value="connections">
              {acceptedLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-card/50 border border-border/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : acceptedConnections.length === 0 ? (
                <EmptyState
                  icon={UserCheck}
                  title="No connections yet"
                  description="Start building your network by connecting with other Dubai investors."
                  action={
                    <Button asChild className="bg-gold hover:bg-gold/90 text-primary-foreground">
                      <Link to="/members">Browse Members</Link>
                    </Button>
                  }
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {acceptedConnections.map((conn) => (
                    <ConnectionCard
                      key={conn.id}
                      connection={conn}
                      profile={conn.profile}
                      type="accepted"
                      onRemove={(id) => removeConnection.mutate(id)}
                      isLoading={isLoading}
                    />
                  ))}
                </motion.div>
              )}
            </TabsContent>

            {/* Requests Received Tab */}
            <TabsContent value="requests">
              {pendingLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-24 bg-card/50 border border-border/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : pendingRequests.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No pending requests"
                  description="When someone sends you a connection request, it will appear here."
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {pendingRequests.map((conn) => (
                    <ConnectionCard
                      key={conn.id}
                      connection={conn}
                      profile={conn.requester!}
                      type="received"
                      onAccept={(id) => acceptRequest.mutate(id)}
                      onReject={(id) => rejectRequest.mutate(id)}
                      isLoading={isLoading}
                    />
                  ))}
                </motion.div>
              )}
            </TabsContent>

            {/* Sent Requests Tab */}
            <TabsContent value="sent">
              {sentLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-24 bg-card/50 border border-border/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : sentRequests.length === 0 ? (
                <EmptyState
                  icon={Send}
                  title="No sent requests"
                  description="When you send a connection request, it will appear here until accepted."
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {sentRequests.map((conn) => (
                    <ConnectionCard
                      key={conn.id}
                      connection={conn}
                      profile={conn.recipient!}
                      type="sent"
                      onCancel={(id) => cancelRequest.mutate(id)}
                      isLoading={isLoading}
                    />
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl shadow-black/5"
    >
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl" />
        <div className="relative p-4 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20">
          <Icon className="h-10 w-10 text-gold" />
        </div>
      </div>
      <h3 className="text-xl font-serif font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </motion.div>
  );
}
