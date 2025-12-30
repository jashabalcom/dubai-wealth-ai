import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCharCount?: boolean;
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCharCount, autoResize, maxLength, value, onChange, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
    
    const charCount = typeof value === "string" ? value.length : 0;

    // Auto-resize effect
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [value, autoResize, textareaRef]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background placeholder:text-muted-foreground",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            autoResize && "resize-none overflow-hidden",
            className
          )}
          ref={textareaRef}
          value={value}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />
        
        {showCharCount && maxLength && (
          <div className="flex justify-end mt-1">
            <span
              className={cn(
                "text-xs transition-colors",
                charCount >= maxLength * 0.9
                  ? "text-destructive"
                  : charCount >= maxLength * 0.7
                  ? "text-amber-500"
                  : "text-muted-foreground"
              )}
            >
              {charCount}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
