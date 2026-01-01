import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from './button';

interface InteractiveButtonProps extends ButtonProps {
  loading?: boolean;
  success?: boolean;
  ripple?: boolean;
  shimmer?: boolean;
  successDuration?: number;
  onSuccessComplete?: () => void;
}

interface RippleEffect {
  id: number;
  x: number;
  y: number;
}

export function InteractiveButton({
  children,
  loading = false,
  success = false,
  ripple = true,
  shimmer = false,
  successDuration = 1500,
  onSuccessComplete,
  className,
  disabled,
  onClick,
  ...props
}: InteractiveButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = React.useState<RippleEffect[]>([]);
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Handle success state
  React.useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        onSuccessComplete?.();
      }, successDuration);
      return () => clearTimeout(timer);
    }
  }, [success, successDuration, onSuccessComplete]);

  // Create ripple effect on click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple: RippleEffect = {
        id: Date.now(),
        x,
        y,
      };
      
      setRipples((prev) => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }
    
    onClick?.(e);
  };

  const isDisabled = disabled || loading;

  return (
    <Button
      ref={buttonRef}
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        shimmer && 'shimmer-button-gold',
        showSuccess && 'bg-green-500 hover:bg-green-500',
        className
      )}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            exit={{ opacity: 0 }}
            style={{
              left: r.x,
              top: r.y,
              transform: 'translate(-50%, -50%)',
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Shimmer overlay */}
      {shimmer && (
        <span className="shimmer-overlay pointer-events-none" />
      )}

      {/* Button content with states */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </motion.span>
        ) : showSuccess ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <Check className="h-4 w-4" />
            </motion.div>
            <span>Success!</span>
          </motion.span>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}

// Animated like button with heart burst
interface LikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
  className?: string;
}

export function LikeButton({ liked, count, onToggle, className }: LikeButtonProps) {
  const [animate, setAnimate] = React.useState(false);

  const handleClick = () => {
    if (!liked) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 700);
    }
    onToggle();
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors',
        liked 
          ? 'text-red-500 bg-red-500/10' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        className
      )}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div className="relative">
        {/* Heart icon */}
        <motion.svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={liked ? 0 : 2}
          animate={animate ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </motion.svg>
        
        {/* Burst particles */}
        <AnimatePresence>
          {animate && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-red-400"
                  initial={{ 
                    scale: 0, 
                    x: 0, 
                    y: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    scale: [0, 1, 0],
                    x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                    y: Math.sin((i * 60 * Math.PI) / 180) * 20,
                    opacity: [1, 1, 0]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Count with animated change */}
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="text-sm font-medium min-w-[1ch]"
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

// Floating reaction emoji
export function FloatingEmoji({ emoji, onComplete }: { emoji: string; onComplete: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed pointer-events-none text-3xl z-50"
      initial={{ opacity: 1, scale: 0.5, y: 0 }}
      animate={{ 
        opacity: [1, 1, 0],
        scale: [0.5, 1.5, 1.2],
        y: -100,
      }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    >
      {emoji}
    </motion.div>
  );
}
