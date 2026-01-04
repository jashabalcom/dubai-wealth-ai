import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowBigUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UpvoteButtonProps {
  count: number;
  hasUpvoted: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isOwnContent?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function UpvoteButton({
  count,
  hasUpvoted,
  onToggle,
  disabled = false,
  isOwnContent = false,
  size = 'md',
  className,
}: UpvoteButtonProps) {
  const { user } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (!user) {
      toast.error('Please sign in to upvote');
      return;
    }
    
    if (isOwnContent) {
      toast.error("You can't upvote your own content");
      return;
    }
    
    if (disabled) return;

    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const fontSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      disabled={disabled || isOwnContent}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200",
        padding,
        hasUpvoted 
          ? "bg-gold/15 text-gold border border-gold/30 shadow-sm shadow-gold/10" 
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent",
        (disabled || isOwnContent) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <motion.div
        animate={isAnimating ? { y: [-2, 0], scale: [1.2, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        <ArrowBigUp 
          className={cn(
            iconSize,
            "transition-all",
            hasUpvoted && "fill-current"
          )} 
        />
      </motion.div>
      <span className={fontSize}>{count}</span>
    </motion.button>
  );
}
