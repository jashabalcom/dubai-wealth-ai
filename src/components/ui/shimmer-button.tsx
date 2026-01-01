import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "dark" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
}

export function ShimmerButton({
  className,
  variant = "gold",
  size = "md",
  isLoading,
  loadingText,
  children,
  disabled,
  ...props
}: ShimmerButtonProps) {
  const sizeClasses = {
    sm: "h-10 px-4 text-xs",
    md: "h-12 px-6 text-sm",
    lg: "h-14 px-8 text-base",
  };

  const variantClasses = {
    gold: "shimmer-button-gold",
    dark: "shimmer-button-dark",
    outline: "shimmer-button-outline",
  };

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center gap-2",
        "font-sans font-medium uppercase tracking-[0.15em]",
        "rounded-sm overflow-hidden",
        "transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-[0.97]",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shimmer overlay */}
      <span className="shimmer-overlay" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}
