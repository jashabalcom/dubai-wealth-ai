import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCheck, Clock, Send, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectionCard } from '@/components/community/ConnectionCard';
import { CommunityPageHeader } from '@/components/community/CommunityPageHeader';
import { SidebarCard } from '@/components/community/SidebarCard';
import { PageTransition } from '@/components/community/PageTransition';
import { useConnections } from '@/hooks/useConnections';
import { COMMUNITY_LAYOUT } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

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
      className={cn(COMMUNITY_LAYOUT.card.base, 'text-center py-12')}
    >
      <div className="relative inline-block mb-5">
        <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl" />
        <div className="relative p-4 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20">
          <Icon className="h-8 w-8 text-gold" />
        </div>
      </div>
      <h3 className="text-lg font-serif font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">{description}</p>
      {action}
    </motion.div>
  );
}

function ConnectionStats({ 
  connections, 
  pending, 
  sent 
}: { 
  connections: number; 
  pending: number; 
  sent: number; 
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Network Stats
      </h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <UserCheck className="h-4 w-4 text-gold" />
            </div>
            <span className="text-sm text-muted-foreground">Connections</span>
          </div>
          <span className="font-semibold">{connections}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Clock className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">Pending</span>
          </div>
          <span className="font-semibold">{pending}</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Send className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Sent</span>
          </div>
          <span className="font-semibold">{sent}</span>
        </div>
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
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

  const isLoading = acceptRequest.isPending || rejectRequest.isPending || 
                    cancelRequest.isPending || removeConnection.isPending;

  return (
    <PageTransition>
      <div className={COMMUNITY_LAYOUT.spacing.content}>
        {/* Header */}
        <CommunityPageHeader
          title="My Connections"
          subtitle="Manage your network of Dubai investors"
          icon={UserCheck}
          count={acceptedConnections.length}
        />

        {/* 12-Column Grid Layout */}
        <div className={COMMUNITY_LAYOUT.grid.container}>
          {/* Left Sidebar - Stats */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(COMMUNITY_LAYOUT.grid.leftSidebar, 'hidden lg:block')}
          >
            <SidebarCard>
              <ConnectionStats 
                connections={acceptedConnections.length}
                pending={pendingRequests.length}
                sent={sentRequests.length}
              />
            </SidebarCard>
          </motion.aside>

          {/* Main Content */}
          <div className={cn(COMMUNITY_LAYOUT.grid.mainContent, 'lg:col-span-9')}>
            <Tabs defaultValue="connections" className="w-full">
              <TabsList className="bg-card/50 border border-border/50 p-1 w-full sm:w-auto">
                <TabsTrigger value="connections" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  <UserCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Connections</span>
                  {acceptedConnections.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-gold/20 text-gold text-xs">
                      {acceptedConnections.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="requests" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Requests</span>
                  {pendingRequests.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-destructive/20 text-destructive text-xs">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="sent" className="gap-2 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Sent</span>
                  {sentRequests.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-muted text-muted-foreground text-xs">
                      {sentRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="connections" className="mt-5">
                {acceptedLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={cn(COMMUNITY_LAYOUT.card.base, 'h-20 animate-pulse')} />
                    ))}
                  </div>
                ) : acceptedConnections.length === 0 ? (
                  <EmptyState
                    icon={UserCheck}
                    title="No connections yet"
                    description="Start building your network by connecting with other Dubai investors."
                    action={
                      <Button asChild className="bg-gold hover:bg-gold/90 text-primary-foreground">
                        <Link to="/community/members">Browse Members</Link>
                      </Button>
                    }
                  />
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
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

              <TabsContent value="requests" className="mt-5">
                {pendingLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className={cn(COMMUNITY_LAYOUT.card.base, 'h-20 animate-pulse')} />
                    ))}
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="No pending requests"
                    description="When someone sends you a connection request, it will appear here."
                  />
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
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

              <TabsContent value="sent" className="mt-5">
                {sentLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className={cn(COMMUNITY_LAYOUT.card.base, 'h-20 animate-pulse')} />
                    ))}
                  </div>
                ) : sentRequests.length === 0 ? (
                  <EmptyState
                    icon={Send}
                    title="No sent requests"
                    description="When you send a connection request, it will appear here until accepted."
                  />
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
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
        </div>
      </div>
    </PageTransition>
  );
}
