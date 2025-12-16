import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { cardHoverVariants, smoothTransition } from "@/lib/motion";

interface MotionCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  hoverEffect?: "lift" | "glow" | "border" | "none";
  glowColor?: "gold" | "primary" | "accent";
}

const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, hoverEffect = "lift", glowColor = "gold", children, ...props }, ref) => {
    const glowColors = {
      gold: "hsl(35 25% 70% / 0.25)",
      primary: "hsl(var(--primary) / 0.25)",
      accent: "hsl(var(--accent) / 0.25)",
    };

    const hoverStyles = {
      lift: {
        rest: { 
          y: 0, 
          scale: 1,
          boxShadow: "0 4px 20px -2px hsl(220 40% 8% / 0.08)",
        },
        hover: { 
          y: -6, 
          scale: 1.01,
          boxShadow: `0 20px 40px -15px ${glowColors[glowColor]}`,
          transition: smoothTransition,
        },
        tap: { 
          scale: 0.99,
          y: -2,
        },
      },
      glow: {
        rest: { 
          boxShadow: "0 0 0 0 transparent",
        },
        hover: { 
          boxShadow: `0 0 30px 0 ${glowColors[glowColor]}`,
          transition: smoothTransition,
        },
        tap: {},
      },
      border: {
        rest: { 
          borderColor: "hsl(var(--border))",
        },
        hover: { 
          borderColor: "hsl(var(--primary))",
          transition: smoothTransition,
        },
        tap: {},
      },
      none: {
        rest: {},
        hover: {},
        tap: {},
      },
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm transition-colors",
          hoverEffect === "border" && "border-2",
          className
        )}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={hoverStyles[hoverEffect]}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionCard.displayName = "MotionCard";

const MotionCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
MotionCardHeader.displayName = "MotionCardHeader";

const MotionCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
MotionCardTitle.displayName = "MotionCardTitle";

const MotionCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
MotionCardDescription.displayName = "MotionCardDescription";

const MotionCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
MotionCardContent.displayName = "MotionCardContent";

const MotionCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
MotionCardFooter.displayName = "MotionCardFooter";

export {
  MotionCard,
  MotionCardHeader,
  MotionCardFooter,
  MotionCardTitle,
  MotionCardDescription,
  MotionCardContent,
};
