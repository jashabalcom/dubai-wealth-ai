import { motion, AnimatePresence } from 'framer-motion';

interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
}

export function TypingIndicator({ isTyping, userName }: TypingIndicatorProps) {
  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-1">
            <motion.span
              className="w-2 h-2 rounded-full bg-muted-foreground/60"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="w-2 h-2 rounded-full bg-muted-foreground/60"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className="w-2 h-2 rounded-full bg-muted-foreground/60"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
          <span>{userName ? `${userName} is typing...` : 'Typing...'}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
