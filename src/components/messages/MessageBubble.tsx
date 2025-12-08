import { format, isToday, isYesterday } from 'date-fns';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isSender: boolean;
  isRead?: boolean;
}

export function MessageBubble({ content, timestamp, isSender, isRead }: MessageBubbleProps) {
  const formatTime = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) {
      return format(d, 'h:mm a');
    } else if (isYesterday(d)) {
      return `Yesterday ${format(d, 'h:mm a')}`;
    }
    return format(d, 'MMM d, h:mm a');
  };

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isSender
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        <div className={`flex items-center gap-1.5 mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
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
  );
}
