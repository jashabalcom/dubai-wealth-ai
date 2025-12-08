import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Users, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useGroupMessages } from '@/hooks/useGroupMessages';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { GroupList } from '@/components/messages/GroupList';
import { GroupChatWindow } from '@/components/messages/GroupChatWindow';
import { PageTransition } from '@/components/community/PageTransition';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function MessagesPage() {
  const { oderId, groupId } = useParams<{ oderId?: string; groupId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(oderId);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(groupId);
  const [activeTab, setActiveTab] = useState<string>(groupId ? 'groups' : 'direct');

  const {
    conversations,
    conversationsLoading,
    messages: directMessages,
    messagesLoading: directMessagesLoading,
    conversationPartner,
    sendMessage: sendDirectMessage,
    markAsRead,
  } = useDirectMessages(selectedUserId);

  const {
    groupChats,
    groupsLoading,
    groupDetails,
    groupMembers,
    messages: groupMessages,
    messagesLoading: groupMessagesLoading,
    sendMessage: sendGroupMessage,
  } = useGroupMessages(selectedGroupId);

  // Sync URL params
  useEffect(() => {
    if (oderId && oderId !== selectedUserId) {
      setSelectedUserId(oderId);
      setActiveTab('direct');
    }
  }, [oderId]);

  useEffect(() => {
    if (groupId && groupId !== selectedGroupId) {
      setSelectedGroupId(groupId);
      setActiveTab('groups');
    }
  }, [groupId]);

  const handleSelectConversation = (id: string) => {
    setSelectedUserId(id);
    setSelectedGroupId(undefined);
    navigate(`/community/messages/${id}`, { replace: true });
  };

  const handleSelectGroup = (id: string) => {
    setSelectedGroupId(id);
    setSelectedUserId(undefined);
    navigate(`/community/messages/group/${id}`, { replace: true });
  };

  const handleSendDirectMessage = (content: string) => {
    if (selectedUserId) {
      sendDirectMessage.mutate({ recipientId: selectedUserId, content });
    }
  };

  const handleSendGroupMessage = (content: string) => {
    if (selectedGroupId) {
      sendGroupMessage.mutate({ content });
    }
  };

  const handleMarkAsRead = (messageIds: string[]) => {
    markAsRead.mutate(messageIds);
  };

  const handleBack = () => {
    setSelectedUserId(undefined);
    setSelectedGroupId(undefined);
    navigate('/community/messages', { replace: true });
  };

  const handleGroupCreated = (newGroupId: string) => {
    handleSelectGroup(newGroupId);
  };

  if (!user) {
    return (
      <PageTransition>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please log in to view messages.</p>
        </div>
      </PageTransition>
    );
  }

  // Mobile: Show either list or chat
  if (isMobile) {
    if (selectedUserId) {
      return (
        <div className="h-[calc(100vh-8rem)] flex flex-col -mx-4 -my-6">
          <ChatWindow
            messages={directMessages}
            partner={conversationPartner}
            currentUserId={user.id}
            onSendMessage={handleSendDirectMessage}
            onMarkAsRead={handleMarkAsRead}
            isSending={sendDirectMessage.isPending}
            isLoading={directMessagesLoading}
            onBack={handleBack}
            showBackButton
          />
        </div>
      );
    }

    if (selectedGroupId) {
      return (
        <div className="h-[calc(100vh-8rem)] flex flex-col -mx-4 -my-6">
          <GroupChatWindow
            messages={groupMessages}
            group={groupDetails}
            members={groupMembers}
            currentUserId={user.id}
            onSendMessage={handleSendGroupMessage}
            isSending={sendGroupMessage.isPending}
            isLoading={groupMessagesLoading}
            onBack={handleBack}
            showBackButton
          />
        </div>
      );
    }

    return (
      <PageTransition>
        <div className="space-y-4 pb-16">
        <div>
          <h2 className="text-xl font-serif font-semibold">Messages</h2>
          <p className="text-sm text-muted-foreground">
            Chat with your connections
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-card/50 border border-border/50 p-1">
            <TabsTrigger value="direct" className="flex-1 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
              <MessageCircle className="h-4 w-4 mr-2" />
              Direct
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex-1 data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
          </TabsList>
          <TabsContent value="direct" className="mt-4">
            <ConversationList
              conversations={conversations}
              selectedUserId={selectedUserId}
              onSelectConversation={handleSelectConversation}
              currentUserId={user.id}
              isLoading={conversationsLoading}
            />
          </TabsContent>
          <TabsContent value="groups" className="mt-4">
            <GroupList
              groups={groupChats}
              selectedGroupId={selectedGroupId}
              onSelectGroup={handleSelectGroup}
              isLoading={groupsLoading}
              onGroupCreated={handleGroupCreated}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
    );
  }

  // Desktop: Side-by-side layout
  return (
    <PageTransition>
      <div className="space-y-5">
        <div>
        <h2 className="text-xl font-serif font-semibold">Messages</h2>
        <p className="text-sm text-muted-foreground">
          Chat with your connections and groups
        </p>
      </div>

      <div className="border border-border/50 rounded-2xl overflow-hidden bg-card/50 h-[calc(100vh-280px)] min-h-[400px] flex">
        {/* Sidebar with tabs */}
        <div className="w-72 border-r border-border/50 shrink-0 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-muted/30 p-1 m-0">
              <TabsTrigger value="direct" className="flex-1 text-xs data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                <MessageCircle className="h-3 w-3 mr-1" />
                Direct
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex-1 text-xs data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                <Users className="h-3 w-3 mr-1" />
                Groups
              </TabsTrigger>
            </TabsList>
            <TabsContent value="direct" className="flex-1 mt-0 overflow-hidden">
              <ConversationList
                conversations={conversations}
                selectedUserId={selectedUserId}
                onSelectConversation={handleSelectConversation}
                currentUserId={user.id}
                isLoading={conversationsLoading}
              />
            </TabsContent>
            <TabsContent value="groups" className="flex-1 mt-0 overflow-hidden">
              <GroupList
                groups={groupChats}
                selectedGroupId={selectedGroupId}
                onSelectGroup={handleSelectGroup}
                isLoading={groupsLoading}
                onGroupCreated={handleGroupCreated}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Window */}
        {activeTab === 'direct' ? (
          <ChatWindow
            messages={directMessages}
            partner={conversationPartner}
            currentUserId={user.id}
            onSendMessage={handleSendDirectMessage}
            onMarkAsRead={handleMarkAsRead}
            isSending={sendDirectMessage.isPending}
            isLoading={directMessagesLoading}
          />
        ) : (
          <GroupChatWindow
            messages={groupMessages}
            group={groupDetails}
            members={groupMembers}
            currentUserId={user.id}
            onSendMessage={handleSendGroupMessage}
            isSending={sendGroupMessage.isPending}
            isLoading={groupMessagesLoading}
          />
        )}
      </div>
    </div>
  </PageTransition>
  );
}
