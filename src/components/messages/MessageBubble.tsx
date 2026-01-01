import { useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { SmilePlus, Lock, ShieldCheck } from 'lucide-react';
import { ReactionPicker } from './ReactionPicker';
import { MessageReactions } from './MessageReactions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ReactionGroup } from '@/hooks/useMessageReactions';

interface MessageBubbleProps {
  id: string;
  content: string;
  timestamp: string;
  isSender: boolean;
  isRead?: boolean;
  isEncrypted?: boolean;
  isDecrypting?: boolean;
  reactions?: ReactionGroup[];
  onReact?: (messageId: string, emoji: string) => void;
}

export function MessageBubble({ 
  id,
  content, 
  timestamp, 
  isSender, 
  isRead,
  isEncrypted = true,
  isDecrypting = false,
  reactions = [],
  onReact,
}: MessageBubbleProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) {
      return format(d, 'h:mm a');
    } else if (isYesterday(d)) {
      return `Yesterday ${format(d, 'h:mm a')}`;
    }
    return format(d, 'MMM d, h:mm a');
  };

  const handleReact = (emoji: string) => {
    onReact?.(id, emoji);
  };

  return (
    <div 
      className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3 group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowPicker(false);
      }}
    >
      <div className={`relative max-w-[75%] ${isSender ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
        <div className="relative">
          {/* Reaction button */}
          {onReact && (
            <div 
              className={`absolute top-1/2 -translate-y-1/2 ${
                isSender ? 'right-full mr-1' : 'left-full ml-1'
              } transition-opacity ${isHovered || showPicker ? 'opacity-100' : 'opacity-0'}`}
            >
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <SmilePlus className="h-4 w-4 text-muted-foreground" />
              </button>
              
              <ReactionPicker
                isOpen={showPicker}
                onSelect={handleReact}
                onClose={() => setShowPicker(false)}
                position={isSender ? 'right' : 'left'}
              />
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-2.5 ${
              isSender
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            }`}
          >
            {isDecrypting ? (
              <p className="text-sm text-muted-foreground/50 italic">Decrypting...</p>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
            )}
            <div className={`flex items-center gap-1.5 mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
              {isEncrypted && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Lock className={`h-3 w-3 ${isSender ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`} />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-green-500" />
                        End-to-end encrypted
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <span className={`text-xs ${isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {formatTime(timestamp)}
              </span>
              {isSender && (
                <span className={`text-xs ${isRead ? 'text-primary-foreground/70' : 'text-primary-foreground/50'}`}>
                  {isRead ? '✓✓' : '✓'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Reactions display */}
        <MessageReactions 
          reactions={reactions} 
          onToggle={handleReact}
          isSender={isSender}
        />
      </div>
    </div>
  );
}
