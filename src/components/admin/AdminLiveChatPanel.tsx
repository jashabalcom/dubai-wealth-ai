import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Send,
  X,
  User,
  Bot,
  Shield,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAdminSupportChat } from '@/hooks/useAdminSupportChat';
import { SupportMessage } from '@/hooks/useRealtimeSupportChat';

interface AdminTicket {
  id: string;
  user_id: string | null;
  initial_message: string;
  status: string;
  category: string | null;
  priority: string;
  ai_confidence_score: number | null;
  escalation_reason: string | null;
  admin_id: string | null;
  admin_joined_at: string | null;
  created_at: string;
  last_message_at: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
    membership_tier: string | null;
  } | null;
}

interface AdminLiveChatPanelProps {
  ticket: AdminTicket;
  onClose: () => void;
  onResolved: () => void;
}

function MessageBubble({ message }: { message: SupportMessage }) {
  const isUser = message.sender_type === 'user';
  const isAI = message.sender_type === 'ai';
  const isAdmin = message.sender_type === 'admin';

  return (
    <div className={cn(
      "flex gap-2 mb-3",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-primary text-primary-foreground" : 
        isAI ? "bg-blue-500/10 text-blue-500" : 
        "bg-green-500/10 text-green-500"
      )}>
        {isUser ? <User className="h-4 w-4" /> : 
         isAI ? <Bot className="h-4 w-4" /> : 
         <Shield className="h-4 w-4" />}
      </div>
      <div className={cn(
        "max-w-[75%] rounded-lg px-3 py-2 text-sm",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : isAI
          ? "bg-blue-500/10"
          : "bg-green-500/10"
      )}>
        <div className="flex items-center gap-2 mb-1 text-[10px] opacity-70">
          <span className="font-medium">
            {isUser ? 'User' : isAI ? 'AI Assistant' : 'Support Agent'}
          </span>
        </div>
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className="text-[10px] mt-1 opacity-70 text-right">
          {format(new Date(message.created_at), 'h:mm a')}
        </div>
      </div>
    </div>
  );
}

export function AdminLiveChatPanel({ ticket, onClose, onResolved }: AdminLiveChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
    isSending,
    activeTicket,
    selectTicket,
    joinConversation,
    sendMessage,
    resolveTicket,
    closeTicket,
  } = useAdminSupportChat();

  // Load ticket on mount
  useEffect(() => {
    selectTicket(ticket);
    return () => closeTicket();
  }, [ticket.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isSending) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResolve = async () => {
    await resolveTicket();
    onResolved();
  };

  const hasJoined = activeTicket?.admin_id != null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Live Chat
                {ticket.status === 'escalated' && (
                  <Badge className="bg-amber-500/10 text-amber-500">Escalated</Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {ticket.profiles?.full_name || 'Anonymous'} • {ticket.profiles?.email || 'No email'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!hasJoined && (
              <Button onClick={joinConversation} size="sm">
                <Shield className="h-4 w-4 mr-1" />
                Join Chat
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResolve}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Resolve
            </Button>
          </div>
        </div>
        
        {ticket.escalation_reason && (
          <div className="mt-2 p-2 rounded bg-amber-500/10 text-amber-600 text-xs">
            <strong>Escalation Reason:</strong> {ticket.escalation_reason}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No messages yet</p>
              <p className="text-sm mt-1">Initial message: {ticket.initial_message}</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </ScrollArea>

        {/* Input - only show if joined */}
        {hasJoined ? (
          <div className="p-3 border-t bg-muted/30">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                className="min-h-[60px] max-h-[120px] resize-none text-sm"
                disabled={isSending}
              />
              <Button
                size="icon"
                className="h-[60px] w-12 shrink-0"
                onClick={handleSend}
                disabled={!inputValue.trim() || isSending}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t bg-muted/30 text-center text-sm text-muted-foreground">
            Click "Join Chat" to respond to this conversation
          </div>
        )}
      </CardContent>
    </Card>
  );
}
