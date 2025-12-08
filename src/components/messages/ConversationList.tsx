import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OnlineIndicator } from '@/components/ui/online-indicator';
import { useOnlineStatus } from '@/contexts/OnlinePresenceContext';
import { Crown, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  user_id: string;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    membership_tier: string;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId?: string;
  onSelectConversation: (userId: string) => void;
  currentUserId: string;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedUserId,
  onSelectConversation,
  currentUserId,
  isLoading,
}: ConversationListProps) {
  const { isUserOnline } = useOnlineStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center px-4">
        <MessageCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground text-sm">No conversations yet</p>
        <p className="text-muted-foreground/70 text-xs mt-1">
          Connect with members to start messaging
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((conv) => {
          const isSelected = selectedUserId === conv.user_id;
          const isSender = conv.last_message.sender_id === currentUserId;
          const messagePreview = isSender 
            ? `You: ${conv.last_message.content}` 
            : conv.last_message.content;
          const isOnline = isUserOnline(conv.user_id);

          return (
            <button
              key={conv.user_id}
              onClick={() => onSelectConversation(conv.user_id)}
              className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                isSelected ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.profile.avatar_url || undefined} />
                    <AvatarFallback>
                      {conv.profile.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <OnlineIndicator 
                    isOnline={isOnline} 
                    size="md" 
                    className="absolute bottom-0 right-0"
                  />
                  {conv.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-medium truncate ${conv.unread_count > 0 ? 'text-foreground' : ''}`}>
                        {conv.profile.full_name || 'Unknown'}
                      </span>
                      {conv.profile.membership_tier === 'elite' && (
                        <Crown className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: false })}
                    </span>
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${
                    conv.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}>
                    {messagePreview.length > 50 
                      ? messagePreview.slice(0, 50) + '...' 
                      : messagePreview}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
