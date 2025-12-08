import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ArrowLeft, Crown, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatWindowProps {
  messages: Message[];
  partner: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    membership_tier: string;
  } | null;
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onMarkAsRead: (messageIds: string[]) => void;
  isSending?: boolean;
  isLoading?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatWindow({
  messages,
  partner,
  currentUserId,
  onSendMessage,
  onMarkAsRead,
  isSending,
  isLoading,
  onBack,
  showBackButton,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    const unreadIds = messages
      .filter((msg) => !msg.is_read && msg.recipient_id === currentUserId)
      .map((msg) => msg.id);
    
    if (unreadIds.length > 0) {
      onMarkAsRead(unreadIds);
    }
  }, [messages, currentUserId, onMarkAsRead]);

  if (!partner) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Link to={`/profile/${partner.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Avatar className="h-10 w-10">
            <AvatarImage src={partner.avatar_url || undefined} />
            <AvatarFallback>
              {partner.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{partner.full_name || 'Unknown User'}</span>
              {partner.membership_tier === 'elite' && (
                <Crown className="h-4 w-4 text-primary" />
              )}
            </div>
            <Badge variant="secondary" className="text-xs capitalize">
              {partner.membership_tier}
            </Badge>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              timestamp={message.created_at}
              isSender={message.sender_id === currentUserId}
              isRead={message.is_read}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={onSendMessage} isLoading={isSending} />
    </div>
  );
}
