import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Messages() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(userId);

  const {
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    conversationPartner,
    sendMessage,
    markAsRead,
  } = useDirectMessages(selectedUserId);

  // Sync URL param with selected user
  useEffect(() => {
    if (userId && userId !== selectedUserId) {
      setSelectedUserId(userId);
    }
  }, [userId]);

  const handleSelectConversation = (id: string) => {
    setSelectedUserId(id);
    navigate(`/messages/${id}`, { replace: true });
  };

  const handleSendMessage = (content: string) => {
    if (selectedUserId) {
      sendMessage.mutate({ recipientId: selectedUserId, content });
    }
  };

  const handleMarkAsRead = (messageIds: string[]) => {
    markAsRead.mutate(messageIds);
  };

  const handleBack = () => {
    setSelectedUserId(undefined);
    navigate('/messages', { replace: true });
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
            messages={messages}
            partner={conversationPartner}
            currentUserId={user.id}
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkAsRead}
            isSending={sendMessage.isPending}
            isLoading={messagesLoading}
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
        <ConversationList
          conversations={conversations}
          selectedUserId={selectedUserId}
          onSelectConversation={handleSelectConversation}
          currentUserId={user.id}
          isLoading={conversationsLoading}
        />
      </div>
    );
  }

  // Desktop: Side-by-side layout
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Chat with your connected members
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden bg-card h-[calc(100vh-200px)] min-h-[500px] flex">
          {/* Conversation List */}
          <div className="w-80 border-r shrink-0 flex flex-col">
            <div className="p-4 border-b bg-muted/30">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Conversations
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <ConversationList
                conversations={conversations}
                selectedUserId={selectedUserId}
                onSelectConversation={handleSelectConversation}
                currentUserId={user.id}
                isLoading={conversationsLoading}
              />
            </div>
          </div>

          {/* Chat Window */}
          <ChatWindow
            messages={messages}
            partner={conversationPartner}
            currentUserId={user.id}
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkAsRead}
            isSending={sendMessage.isPending}
            isLoading={messagesLoading}
          />
        </div>
      </div>
    </div>
  );
}
