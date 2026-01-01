import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-sans select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:shadow-gold hover:scale-[1.02] rounded-sm uppercase tracking-[0.1em] focus-visible:ring-gold/50 active:scale-[0.97] active:transition-all active:duration-75",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md active:scale-[0.97] active:transition-all active:duration-75",
        outline:
          "border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground rounded-sm uppercase tracking-[0.1em] focus-visible:ring-gold/50 active:scale-[0.97] active:transition-all active:duration-75",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm uppercase tracking-[0.1em] active:scale-[0.97] active:transition-all active:duration-75",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground rounded-md active:bg-accent/80 active:scale-[0.97] active:transition-all active:duration-75",
        link: 
          "text-primary underline-offset-4 hover:underline active:scale-100",
        gold:
          "relative overflow-hidden bg-gradient-to-r from-primary to-gold-light text-secondary hover:shadow-gold hover:scale-[1.02] rounded-sm uppercase tracking-[0.1em] focus-visible:ring-gold/50 active:scale-[0.97] active:transition-all active:duration-75 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        hero:
          "relative overflow-hidden bg-primary text-primary-foreground hover:shadow-gold hover:scale-[1.02] rounded-sm uppercase tracking-[0.15em] border border-primary/20 focus-visible:ring-gold/50 active:scale-[0.97] active:transition-all active:duration-75 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        "hero-outline":
          "bg-transparent border border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10 hover:border-secondary-foreground/50 rounded-sm uppercase tracking-[0.15em] active:bg-secondary-foreground/15 active:scale-[0.97] active:transition-all active:duration-75",
        nav:
          "bg-transparent text-foreground hover:text-primary transition-colors uppercase tracking-[0.1em] text-xs active:scale-100",
        private:
          "border-2 border-primary bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground rounded-sm uppercase tracking-[0.1em] focus-visible:ring-gold/50 active:scale-[0.97] active:transition-all active:duration-75",
        success:
          "bg-emerald-500 text-white hover:bg-emerald-600 rounded-sm uppercase tracking-[0.1em] active:scale-[0.97] active:transition-all active:duration-75",
        // New premium variant
        premium:
          "relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-navy-light text-secondary-foreground border border-primary/30 hover:border-primary/60 hover:shadow-glow-gold rounded-sm uppercase tracking-[0.12em] active:scale-[0.97] active:transition-all active:duration-75 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000",
      },
      size: {
        default: "h-12 px-6 sm:px-8 py-3",
        sm: "h-10 px-4 sm:px-6 py-2 text-xs",
        lg: "h-14 px-8 sm:px-10 py-4 text-base",
        xl: "h-16 px-10 sm:px-12 py-5 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-12 w-12",
        touch: "h-12 min-w-[48px] px-6 sm:px-8",
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
