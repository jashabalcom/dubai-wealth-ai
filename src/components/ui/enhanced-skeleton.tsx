import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnhancedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "shimmer" | "pulse" | "wave";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

const EnhancedSkeleton = React.forwardRef<HTMLDivElement, EnhancedSkeletonProps>(
  ({ className, variant = "shimmer", rounded = "md", ...props }, ref) => {
    const roundedClasses = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    };

    if (variant === "shimmer") {
      return (
        <div
          ref={ref}
          className={cn(
            "relative overflow-hidden bg-muted",
            roundedClasses[rounded],
            className
          )}
          {...props}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                90deg,
                transparent 0%,
                hsl(var(--primary) / 0.08) 50%,
                transparent 100%
              )`,
            }}
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
        </div>
      );
    }

    if (variant === "wave") {
      return (
        <div
          ref={ref}
          className={cn(
            "relative overflow-hidden bg-muted",
            roundedClasses[rounded],
            className
          )}
          {...props}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                90deg,
                transparent 0%,
                hsl(var(--gold) / 0.15) 25%,
                hsl(var(--gold) / 0.25) 50%,
                hsl(var(--gold) / 0.15) 75%,
                transparent 100%
              )`,
            }}
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </div>
      );
    }

    if (variant === "pulse") {
      return (
        <motion.div
          ref={ref}
          className={cn(
            "bg-muted",
            roundedClasses[rounded],
            className
          )}
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-muted",
          roundedClasses[rounded],
          className
        )}
        {...props}
      />
    );
  }
);
EnhancedSkeleton.displayName = "EnhancedSkeleton";

// Enhanced skeleton card with staggered children
interface EnhancedSkeletonCardProps {
  className?: string;
  variant?: "default" | "shimmer" | "wave";
}

const EnhancedSkeletonCard: React.FC<EnhancedSkeletonCardProps> = ({ 
  className, 
  variant = "shimmer" 
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.div
      className={cn(
        "rounded-2xl bg-card border border-border overflow-hidden",
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <EnhancedSkeleton variant={variant} className="aspect-[4/3] rounded-none" />
      </motion.div>
      <div className="p-5 space-y-3">
        <motion.div variants={itemVariants}>
          <EnhancedSkeleton variant={variant} className="h-4 w-1/3" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <EnhancedSkeleton variant={variant} className="h-5 w-full" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <EnhancedSkeleton variant={variant} className="h-6 w-1/2" />
        </motion.div>
        <motion.div variants={itemVariants} className="flex gap-4 pt-2">
          <EnhancedSkeleton variant={variant} className="h-4 w-16" />
          <EnhancedSkeleton variant={variant} className="h-4 w-16" />
          <EnhancedSkeleton variant={variant} className="h-4 w-20" />
        </motion.div>
      </div>
    </motion.div>
  );
};
EnhancedSkeletonCard.displayName = "EnhancedSkeletonCard";

// Enhanced skeleton text block
interface EnhancedSkeletonTextProps {
  className?: string;
  lines?: number;
  variant?: "default" | "shimmer" | "wave";
}

const EnhancedSkeletonText: React.FC<EnhancedSkeletonTextProps> = ({ 
  className, 
  lines = 3, 
  variant = "shimmer" 
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const lineVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className={cn("space-y-2", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div key={i} variants={lineVariants}>
          <EnhancedSkeleton
            variant={variant}
            className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
EnhancedSkeletonText.displayName = "EnhancedSkeletonText";

// Enhanced skeleton avatar
interface EnhancedSkeletonAvatarProps {
  className?: string;
  size?: "sm" | "default" | "lg" | "xl";
  variant?: "default" | "shimmer" | "pulse";
}

const EnhancedSkeletonAvatar: React.FC<EnhancedSkeletonAvatarProps> = ({ 
  className, 
  size = "default", 
  variant = "shimmer" 
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <EnhancedSkeleton
        variant={variant}
        rounded="full"
        className={cn(sizeClasses[size], className)}
      />
    </motion.div>
  );
};
EnhancedSkeletonAvatar.displayName = "EnhancedSkeletonAvatar";

export {
  EnhancedSkeleton,
  EnhancedSkeletonCard,
  EnhancedSkeletonText,
  EnhancedSkeletonAvatar,
};
