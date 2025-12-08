import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useGroupMessages } from '@/hooks/useGroupMessages';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { GroupList } from '@/components/messages/GroupList';
import { GroupChatWindow } from '@/components/messages/GroupChatWindow';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Messages() {
  const { userId, groupId } = useParams<{ userId?: string; groupId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(userId);
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

  // Sync URL param with selected user/group
  useEffect(() => {
    if (userId && userId !== selectedUserId) {
      setSelectedUserId(userId);
      setActiveTab('direct');
    }
  }, [userId]);

  useEffect(() => {
    if (groupId && groupId !== selectedGroupId) {
      setSelectedGroupId(groupId);
      setActiveTab('groups');
    }
  }, [groupId]);

  const handleSelectConversation = (id: string) => {
    setSelectedUserId(id);
    setSelectedGroupId(undefined);
    navigate(`/messages/${id}`, { replace: true });
  };

  const handleSelectGroup = (id: string) => {
    setSelectedGroupId(id);
    setSelectedUserId(undefined);
    navigate(`/messages/group/${id}`, { replace: true });
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
    navigate('/messages', { replace: true });
  };

  const handleGroupCreated = (newGroupId: string) => {
    handleSelectGroup(newGroupId);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view messages.</p>
      </div>
    );
  }

  // Mobile: Show either list or chat
  if (isMobile) {
    if (selectedUserId) {
      return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
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
        <div className="h-[calc(100vh-4rem)] flex flex-col">
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
      <div className="min-h-screen bg-background">
        <div className="border-b p-4">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="direct"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Direct
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
          </TabsList>
          <TabsContent value="direct" className="mt-0">
            <ConversationList
              conversations={conversations}
              selectedUserId={selectedUserId}
              onSelectConversation={handleSelectConversation}
              currentUserId={user.id}
              isLoading={conversationsLoading}
            />
          </TabsContent>
          <TabsContent value="groups" className="mt-0">
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
    );
  }

  // Desktop: Side-by-side layout with tabs
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Chat with your connections and groups
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden bg-card h-[calc(100vh-200px)] min-h-[500px] flex">
          {/* Sidebar with tabs */}
          <div className="w-80 border-r shrink-0 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 p-1">
                <TabsTrigger value="direct" className="flex-1 text-xs">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Direct
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex-1 text-xs">
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
    </div>
  );
}
