import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Bot,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSupportChat, Message } from '@/hooks/useSupportChat';
import { useAuth } from '@/hooks/useAuth';

const QUICK_ACTIONS = [
  { label: 'How do I use the ROI calculator?', icon: '📊' },
  { label: 'Tell me about Golden Visa', icon: '🏆' },
  { label: 'Help with my subscription', icon: '💳' },
  { label: 'How do I contact an agent?', icon: '👤' },
];

function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex gap-2 mb-3",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn(
        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-foreground"
      )}>
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className={cn(
          "text-[10px] mt-1 opacity-70",
          isUser ? "text-right" : "text-left"
        )}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export function AISupportChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    messages,
    isLoading,
    error,
    isEscalated,
    category,
    sendMessage,
    requestEscalation,
    startNewConversation,
    resolveConversation,
  } = useSupportChat();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Only show chat for authenticated users - must be after all hooks
  if (!user) {
    return null;
  }

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
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

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[360px] h-[500px] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Support</h3>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted-foreground">Online 24/7</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={startNewConversation}
                  title="Start new conversation"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status Banner */}
          {isEscalated && (
            <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-amber-600 dark:text-amber-400">
                Escalated to human support
              </span>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">How can I help you today?</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  I can answer questions about properties, subscriptions, Golden Visa, and more.
                </p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.label)}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted transition-colors text-left text-xs"
                    >
                      <span>{action.icon}</span>
                      <span className="line-clamp-2">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <MessageBubble 
                    key={`${msg.timestamp}-${idx}`} 
                    message={msg} 
                    isLast={idx === messages.length - 1}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </ScrollArea>

          {/* Error */}
          {error && (
            <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              {error}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border bg-muted/30">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[44px] max-h-[100px] resize-none text-sm"
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="h-11 w-11 shrink-0"
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {messages.length > 0 && !isEscalated && (
              <button
                onClick={() => requestEscalation('User requested human support')}
                className="text-[10px] text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Need human support?
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        size="lg"
        className={cn(
          "rounded-full h-14 w-14 shadow-lg",
          isOpen 
            ? "bg-muted text-foreground hover:bg-muted/80" 
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
