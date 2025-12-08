import { useRef, useEffect } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageInput } from './MessageInput';
import { GroupMessage, GroupMember, GroupChat } from '@/hooks/useGroupMessages';
import { formatDistanceToNow } from 'date-fns';

interface GroupChatWindowProps {
  messages: GroupMessage[];
  group: GroupChat | null;
  members: GroupMember[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  isSending: boolean;
  isLoading: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function GroupChatWindow({
  messages,
  group,
  members,
  currentUserId,
  onSendMessage,
  isSending,
  isLoading,
  onBack,
  showBackButton,
}: GroupChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a group chat or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={group.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{group.name}</h3>
          <p className="text-xs text-muted-foreground">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId;
              const showAvatar =
                !isOwn &&
                (index === 0 || messages[index - 1].sender_id !== message.sender_id);

              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwn && showAvatar && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={message.sender?.avatar_url || undefined} />
                      <AvatarFallback>
                        {message.sender?.full_name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!isOwn && !showAvatar && <div className="w-8" />}
                  <div
                    className={`max-w-[70%] ${
                      isOwn ? 'items-end' : 'items-start'
                    }`}
                  >
                    {!isOwn && showAvatar && (
                      <p className="text-xs text-muted-foreground mb-1 ml-1">
                        {message.sender?.full_name || 'Unknown'}
                      </p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p
                      className={`text-[10px] text-muted-foreground mt-1 ${
                        isOwn ? 'text-right' : 'text-left'
                      } ml-1`}
                    >
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <MessageInput
          onSend={onSendMessage}
          isLoading={isSending}
          disabled={false}
        />
      </div>
    </div>
  );
}
