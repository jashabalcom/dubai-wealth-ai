import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ReactionGroup {
  emoji: string;
  count: number;
  hasReacted: boolean;
  users?: string[];
}

interface PostReactionsProps {
  reactions: ReactionGroup[];
  onToggleReaction: (emoji: string) => void;
  disabled?: boolean;
}

const AVAILABLE_EMOJIS = ['👍', '❤️', '🎉', '🔥', '💡', '👏', '😂', '🚀'];

export function PostReactions({ reactions, onToggleReaction, disabled }: PostReactionsProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleSelectEmoji = (emoji: string) => {
    onToggleReaction(emoji);
    setIsPickerOpen(false);
  };

  // Filter to only show emojis with reactions
  const activeReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <AnimatePresence mode="popLayout">
        {activeReactions.map((reaction) => (
          <TooltipProvider key={reaction.emoji}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggleReaction(reaction.emoji)}
                  disabled={disabled}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm transition-all",
                    reaction.hasReacted
                      ? "bg-gold/20 text-gold border border-gold/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span>{reaction.emoji}</span>
                  <span className="font-medium text-xs">{reaction.count}</span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {reaction.users && reaction.users.length > 0
                  ? reaction.users.slice(0, 5).join(', ') + (reaction.users.length > 5 ? ` +${reaction.users.length - 5} more` : '')
                  : `${reaction.count} reaction${reaction.count !== 1 ? 's' : ''}`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </AnimatePresence>

      {/* Add Reaction Button */}
      {!disabled && (
        <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50",
                activeReactions.length === 0 && "opacity-0 group-hover:opacity-100 transition-opacity"
              )}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-2 bg-card border-border/50"
            align="start"
            sideOffset={4}
          >
            <div className="flex gap-1">
              {AVAILABLE_EMOJIS.map((emoji) => {
                const existingReaction = reactions.find(r => r.emoji === emoji);
                return (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSelectEmoji(emoji)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-colors",
                      existingReaction?.hasReacted
                        ? "bg-gold/20 ring-1 ring-gold/30"
                        : "hover:bg-muted/50"
                    )}
                  >
                    {emoji}
                  </motion.button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}