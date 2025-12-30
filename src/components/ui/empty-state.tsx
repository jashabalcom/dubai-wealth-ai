import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  children?: ReactNode;
  /** Visual variant - 'default' for standard, 'minimal' for compact */
  variant?: 'default' | 'minimal';
  /** Optional illustration or custom icon element */
  illustration?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
  variant = 'default',
  illustration,
}: EmptyStateProps) {
  const isMinimal = variant === 'minimal';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        isMinimal ? 'py-8 px-4' : 'py-12 sm:py-16 px-4',
        className
      )}
    >
      {/* Icon with decorative background */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={cn(
          "relative flex items-center justify-center mb-4 sm:mb-6",
          isMinimal ? "w-14 h-14" : "w-16 h-16 sm:w-20 sm:h-20"
        )}
      >
        {/* Decorative rings */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 rotate-3" />
        <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-background to-muted/60 -rotate-2" />
        
        {/* Icon container */}
        <div className={cn(
          "relative rounded-xl bg-muted/50 flex items-center justify-center backdrop-blur-sm",
          isMinimal ? "w-12 h-12" : "w-14 h-14 sm:w-16 sm:h-16"
        )}>
          {illustration || (
            <Icon className={cn(
              "text-muted-foreground/60",
              isMinimal ? "w-6 h-6" : "w-7 h-7 sm:w-8 sm:h-8"
            )} />
          )}
        </div>
      </motion.div>
      
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className={cn(
          "font-heading text-foreground mb-1.5 sm:mb-2",
          isMinimal ? "text-lg" : "text-lg sm:text-xl"
        )}
      >
        {title}
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className={cn(
          "text-muted-foreground",
          isMinimal ? "text-sm max-w-xs mb-4" : "text-sm sm:text-base max-w-sm mb-5 sm:mb-6"
        )}
      >
        {description}
      </motion.p>
      
      {(action || secondaryAction || children) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
        >
          {action && (
            action.href ? (
              <Button variant="gold" size={isMinimal ? 'sm' : 'default'} asChild className="min-w-[120px]">
                <Link to={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button variant="gold" size={isMinimal ? 'sm' : 'default'} onClick={action.onClick} className="min-w-[120px]">
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" size={isMinimal ? 'sm' : 'default'} asChild>
                <Link to={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button variant="outline" size={isMinimal ? 'sm' : 'default'} onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
