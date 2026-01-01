import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BrandedLoaderProps {
  variant?: 'fullscreen' | 'inline' | 'minimal' | 'skeleton';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  showProgress?: boolean;
  progress?: number;
}

const sizes = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

// Luxury animated logo icon - stylized "D" for Dubai
function LogoIcon({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Outer ring with gradient */}
      <motion.circle
        cx="24"
        cy="24"
        r="22"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      
      {/* Inner rotating ring */}
      <motion.circle
        cx="24"
        cy="24"
        r="18"
        stroke="hsl(var(--gold))"
        strokeWidth="0.5"
        strokeDasharray="4 4"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Stylized "DWH" monogram */}
      <motion.text
        x="24"
        y="28"
        textAnchor="middle"
        fill="hsl(var(--gold))"
        fontSize="14"
        fontFamily="Cormorant Garamond, Georgia, serif"
        fontWeight="600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        DWH
      </motion.text>
      
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(35 25% 70%)" />
          <stop offset="50%" stopColor="hsl(40 35% 55%)" />
          <stop offset="100%" stopColor="hsl(35 25% 70%)" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

// Pulsing dots loader
function PulsingDots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-gold-light"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

export function BrandedLoader({
  variant = 'inline',
  size = 'md',
  text,
  className,
  showProgress = false,
  progress = 0,
}: BrandedLoaderProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center gap-3', className)}>
        <motion.div
          className={cn('border-2 border-primary border-t-transparent rounded-full', sizes[size])}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {text && <span className={cn('text-muted-foreground', textSizes[size])}>{text}</span>}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="skeleton-wave h-4 w-3/4 rounded" />
        <div className="skeleton-wave h-4 w-full rounded" />
        <div className="skeleton-wave h-4 w-2/3 rounded" />
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--gold)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }} />
        </div>
        
        <motion.div
          className="relative flex flex-col items-center gap-6"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
        >
          <LogoIcon className={sizes.xl} />
          
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <PulsingDots />
            {text && (
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                {text}
              </p>
            )}
          </motion.div>
          
          {showProgress && <ProgressBar progress={progress} />}
        </motion.div>
        
        {/* Brand tagline */}
        <motion.p
          className="absolute bottom-8 text-xs text-muted-foreground/50 tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Dubai Wealth Hub
        </motion.p>
      </motion.div>
    );
  }

  // Default inline variant
  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center gap-4', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <LogoIcon className={sizes[size]} />
      {text && (
        <p className={cn('text-muted-foreground', textSizes[size])}>{text}</p>
      )}
      {showProgress && <ProgressBar progress={progress} />}
    </motion.div>
  );
}

// Skeleton components for specific use cases
export function PostCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton-wave w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton-wave h-4 w-1/4 rounded" />
          <div className="skeleton-wave h-3 w-1/6 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton-wave h-4 w-full rounded" />
        <div className="skeleton-wave h-4 w-5/6 rounded" />
        <div className="skeleton-wave h-4 w-4/6 rounded" />
      </div>
      <div className="flex gap-4 pt-2">
        <div className="skeleton-wave h-8 w-16 rounded" />
        <div className="skeleton-wave h-8 w-16 rounded" />
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <div className="skeleton-wave w-8 h-8 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1 max-w-[70%]">
        <div className="skeleton-wave h-4 w-full rounded-xl" />
        <div className="skeleton-wave h-4 w-2/3 rounded-xl" />
      </div>
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden">
      <div className="skeleton-wave aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton-wave h-5 w-3/4 rounded" />
        <div className="skeleton-wave h-4 w-1/2 rounded" />
        <div className="flex justify-between pt-2">
          <div className="skeleton-wave h-6 w-1/3 rounded" />
          <div className="skeleton-wave h-6 w-1/4 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="skeleton-wave w-16 h-16 rounded-full" />
      <div className="space-y-2 flex-1">
        <div className="skeleton-wave h-5 w-1/3 rounded" />
        <div className="skeleton-wave h-4 w-1/2 rounded" />
        <div className="skeleton-wave h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="skeleton-wave h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
}
