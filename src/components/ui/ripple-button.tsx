import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { springTransition } from "@/lib/motion";

const rippleButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-sans overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:shadow-gold rounded-sm uppercase tracking-[0.1em] focus-visible:ring-gold/50",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md",
        outline:
          "border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground rounded-sm uppercase tracking-[0.1em] focus-visible:ring-gold/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm uppercase tracking-[0.1em]",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground rounded-md",
        link: 
          "text-primary underline-offset-4 hover:underline",
        gold:
          "bg-gradient-to-r from-primary to-gold-light text-secondary hover:shadow-gold rounded-sm uppercase tracking-[0.1em] focus-visible:ring-gold/50",
      },
      size: {
        default: "h-12 px-6 sm:px-8 py-3",
        sm: "h-10 px-4 sm:px-6 py-2 text-xs",
        lg: "h-14 px-8 sm:px-10 py-4 text-base",
        xl: "h-16 px-10 sm:px-12 py-5 text-base",
        icon: "h-10 w-10",
        touch: "h-12 min-w-[48px] px-6 sm:px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface RippleProps {
  x: number;
  y: number;
  id: number;
}

export interface RippleButtonProps
  extends VariantProps<typeof rippleButtonVariants> {
  asChild?: boolean;
  rippleColor?: string;
  disableRipple?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    rippleColor,
    disableRipple = false,
    children,
    onClick,
    disabled,
    type = "button",
  }, ref) => {
    const [ripples, setRipples] = React.useState<RippleProps[]>([]);
    const rippleIdRef = React.useRef(0);

    const getRippleColor = () => {
      if (rippleColor) return rippleColor;
      switch (variant) {
        case "default":
        case "gold":
          return "hsl(var(--primary-foreground) / 0.3)";
        case "outline":
        case "ghost":
          return "hsl(var(--primary) / 0.2)";
        case "secondary":
          return "hsl(var(--secondary-foreground) / 0.2)";
        case "destructive":
          return "hsl(var(--destructive-foreground) / 0.3)";
        default:
          return "hsl(var(--foreground) / 0.2)";
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableRipple && !disabled) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const newRipple = { x, y, id: rippleIdRef.current++ };
        setRipples(prev => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
      }
      
      onClick?.(e);
    };

    if (asChild) {
      return <Slot className={cn(rippleButtonVariants({ variant, size, className }))}>{children}</Slot>;
    }

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(rippleButtonVariants({ variant, size, className }))}
        onClick={handleClick}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={springTransition}
      >
        {/* Ripple effects */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                backgroundColor: getRippleColor(),
                width: 10,
                height: 10,
                marginLeft: -5,
                marginTop: -5,
              }}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
        
        {/* Button content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  }
);
RippleButton.displayName = "RippleButton";

export { RippleButton, rippleButtonVariants };
