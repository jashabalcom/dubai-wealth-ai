import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function MessageInput({ onSend, onTyping, isLoading, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (content.trim() && !isLoading && !disabled) {
      onSend(content.trim());
      setContent('');
      onTyping?.(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onTyping?.(newContent.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  return (
    <div className="flex items-end gap-2 p-4 border-t bg-background">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="min-h-[44px] max-h-[120px] resize-none"
        disabled={disabled || isLoading}
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={!content.trim() || isLoading || disabled}
        size="icon"
        className="shrink-0 h-11 w-11"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
