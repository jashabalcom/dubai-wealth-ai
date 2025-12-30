import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-sans active:scale-[0.97] active:transition-transform active:duration-75 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:shadow-gold hover:scale-[1.02] rounded-sm uppercase tracking-[0.1em] focus-visible:ring-gold/50 active:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md active:brightness-95",
        outline:
          "border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground rounded-sm uppercase tracking-[0.1em] focus-visible:ring-gold/50 active:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm uppercase tracking-[0.1em] active:brightness-95",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground rounded-md active:bg-accent/80",
        link: 
          "text-primary underline-offset-4 hover:underline active:scale-100",
        gold:
          "bg-gradient-to-r from-primary to-gold-light text-secondary hover:shadow-gold hover:scale-[1.02] rounded-sm uppercase tracking-[0.1em] focus-visible:ring-gold/50 active:brightness-95",
        hero:
          "bg-primary text-primary-foreground hover:shadow-gold hover:scale-[1.02] rounded-sm uppercase tracking-[0.15em] border border-primary/20 focus-visible:ring-gold/50 active:brightness-95",
        "hero-outline":
          "bg-transparent border border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10 hover:border-secondary-foreground/50 rounded-sm uppercase tracking-[0.15em] active:bg-secondary-foreground/15",
        nav:
          "bg-transparent text-foreground hover:text-primary transition-colors uppercase tracking-[0.1em] text-xs active:scale-100",
        private:
          "border-2 border-primary bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground rounded-sm uppercase tracking-[0.1em] focus-visible:ring-gold/50 active:brightness-95",
        // New success variant for completed actions
        success:
          "bg-emerald-500 text-white hover:bg-emerald-600 rounded-sm uppercase tracking-[0.1em] active:brightness-95",
      },
      size: {
        default: "h-12 px-6 sm:px-8 py-3",
        sm: "h-10 px-4 sm:px-6 py-2 text-xs",
        lg: "h-14 px-8 sm:px-10 py-4 text-base",
        xl: "h-16 px-10 sm:px-12 py-5 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-12 w-12", // 48px - ideal touch target
        touch: "h-12 min-w-[48px] px-6 sm:px-8", // Touch-friendly size (48px height)
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, loadingText, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
