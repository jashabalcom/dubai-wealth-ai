import { motion, AnimatePresence } from 'framer-motion';
import { REACTION_EMOJIS } from '@/hooks/useMessageReactions';

interface ReactionPickerProps {
  isOpen: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  position?: 'left' | 'right';
}

export function ReactionPicker({ isOpen, onSelect, onClose, position = 'left' }: ReactionPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          
          {/* Picker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.15 }}
            className={`absolute bottom-full mb-2 z-50 flex gap-1 p-2 bg-popover border rounded-full shadow-lg ${
              position === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded-full transition-colors hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
