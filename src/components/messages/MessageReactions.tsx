import { motion } from 'framer-motion';
import type { ReactionGroup } from '@/hooks/useMessageReactions';

interface MessageReactionsProps {
  reactions: ReactionGroup[];
  onToggle: (emoji: string) => void;
  isSender: boolean;
}

export function MessageReactions({ reactions, onToggle, isSender }: MessageReactionsProps) {
  if (reactions.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 mt-1 ${isSender ? 'justify-end' : 'justify-start'}`}>
      {reactions.map((reaction) => (
        <motion.button
          key={reaction.emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggle(reaction.emoji)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
            reaction.userReacted
              ? 'bg-primary/20 border border-primary/40'
              : 'bg-muted/80 border border-border hover:bg-muted'
          }`}
        >
          <span>{reaction.emoji}</span>
          <span className="text-muted-foreground">{reaction.count}</span>
        </motion.button>
      ))}
    </div>
  );
}
