import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const luxuryCardVariants = cva(
  "relative overflow-hidden transition-all duration-500 ease-out",
  {
    variants: {
      variant: {
        default: [
          "bg-card border border-border/50",
          "hover:border-primary/30 hover:shadow-elegant",
          "rounded-2xl",
        ].join(" "),
        glass: [
          "backdrop-blur-xl bg-card/60 border border-border/30",
          "hover:bg-card/80 hover:border-primary/40",
          "rounded-2xl shadow-lg",
        ].join(" "),
        elevated: [
          "bg-card border border-border/40",
          "shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
          "hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] hover:-translate-y-1",
          "rounded-2xl",
        ].join(" "),
        bordered: [
          "bg-transparent border-2 border-border",
          "hover:border-primary/60 hover:bg-card/50",
          "rounded-xl",
        ].join(" "),
        dark: [
          "bg-secondary text-secondary-foreground",
          "border border-border/20",
          "hover:border-primary/40",
          "rounded-2xl",
        ].join(" "),
        feature: [
          "bg-gradient-to-br from-card via-card to-muted/30",
          "border border-border/50",
          "hover:border-primary/40 hover:shadow-gold",
          "rounded-3xl",
        ].join(" "),
        premium: [
          "bg-gradient-to-br from-secondary via-secondary to-navy-light",
          "border border-primary/20 text-secondary-foreground",
          "hover:border-primary/50 hover:shadow-glow-gold",
          "rounded-2xl",
        ].join(" "),
      },
      padding: {
        none: "",
        sm: "p-4 sm:p-5",
        default: "p-5 sm:p-6 md:p-8",
        lg: "p-6 sm:p-8 md:p-10",
        xl: "p-8 sm:p-10 md:p-12",
      },
      interactive: {
        true: "cursor-pointer active:scale-[0.98] active:transition-transform active:duration-75",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      interactive: false,
    },
  }
);

export interface LuxuryCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof luxuryCardVariants> {
  /** Adds a subtle gold accent line at the top */
  accentTop?: boolean;
  /** Adds a glow effect on hover */
  glowOnHover?: boolean;
}

const LuxuryCard = React.forwardRef<HTMLDivElement, LuxuryCardProps>(
  ({ className, variant, padding, interactive, accentTop, glowOnHover, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        luxuryCardVariants({ variant, padding, interactive }),
        glowOnHover && "hover:shadow-glow-gold",
        className
      )}
      {...props}
    >
      {accentTop && (
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      )}
      {children}
    </div>
  )
);
LuxuryCard.displayName = "LuxuryCard";

const LuxuryCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 mb-6", className)}
    {...props}
  />
));
LuxuryCardHeader.displayName = "LuxuryCardHeader";

const LuxuryCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl sm:text-2xl font-serif font-semibold tracking-tight",
      className
    )}
    {...props}
  />
));
LuxuryCardTitle.displayName = "LuxuryCardTitle";

const LuxuryCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
LuxuryCardDescription.displayName = "LuxuryCardDescription";

const LuxuryCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
LuxuryCardContent.displayName = "LuxuryCardContent";

const LuxuryCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center mt-6 pt-6 border-t border-border/50", className)}
    {...props}
  />
));
LuxuryCardFooter.displayName = "LuxuryCardFooter";

export {
  LuxuryCard,
  LuxuryCardHeader,
  LuxuryCardTitle,
  LuxuryCardDescription,
  LuxuryCardContent,
  LuxuryCardFooter,
  luxuryCardVariants,
};
