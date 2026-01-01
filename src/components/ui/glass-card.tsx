import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "gold";
  blur?: "sm" | "md" | "lg";
  hover?: boolean;
  glow?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "light", blur = "md", hover = true, glow = false, children, ...props }, ref) => {
    const blurValues = {
      sm: "backdrop-blur-sm",
      md: "backdrop-blur-md",
      lg: "backdrop-blur-lg",
    };

    const variantStyles = {
      light: "bg-card/70 border-border/50",
      dark: "bg-secondary/80 border-border/30 text-secondary-foreground",
      gold: "bg-primary/10 border-primary/30",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border shadow-lg transition-all duration-300",
          blurValues[blur],
          variantStyles[variant],
          hover && "hover:shadow-xl hover:-translate-y-1 hover:border-primary/50",
          glow && "animate-border-glow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

// Motion-enhanced version
const MotionGlassCard = React.forwardRef<HTMLDivElement, GlassCardProps & HTMLMotionProps<"div">>(
  ({ className, variant = "light", blur = "md", hover = true, glow = false, children, ...props }, ref) => {
    const blurValues = {
      sm: "backdrop-blur-sm",
      md: "backdrop-blur-md",
      lg: "backdrop-blur-lg",
    };

    const variantStyles = {
      light: "bg-card/70 border-border/50",
      dark: "bg-secondary/80 border-border/30 text-secondary-foreground",
      gold: "bg-primary/10 border-primary/30",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl border shadow-lg transition-colors duration-300",
          blurValues[blur],
          variantStyles[variant],
          glow && "animate-border-glow",
          className
        )}
        whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
        transition={{ duration: 0.2, ease: "easeOut" }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionGlassCard.displayName = "MotionGlassCard";

export { GlassCard, MotionGlassCard };
