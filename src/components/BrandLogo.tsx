import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  showAccentLine?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    line1: "text-sm md:text-base",
    line2: "text-[9px] md:text-[10px]",
    tagline: "text-[7px] md:text-[8px]",
    accentLine: "w-8 md:w-10",
    gap: "gap-0.5",
  },
  md: {
    line1: "text-lg md:text-xl",
    line2: "text-[10px] md:text-[11px]",
    tagline: "text-[8px] md:text-[9px]",
    accentLine: "w-10 md:w-12",
    gap: "gap-0.5",
  },
  lg: {
    line1: "text-xl md:text-2xl",
    line2: "text-[11px] md:text-[13px]",
    tagline: "text-[9px] md:text-[10px]",
    accentLine: "w-12 md:w-16",
    gap: "gap-1",
  },
};

export function BrandLogo({
  variant = "light",
  size = "md",
  showTagline = true,
  showAccentLine = true,
  className,
}: BrandLogoProps) {
  const sizes = sizeClasses[size];
  
  const textColorClass = variant === "dark" 
    ? "text-secondary-foreground" 
    : "text-foreground";

  return (
    <motion.div
      className={cn("flex flex-col items-start", sizes.gap, className)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Main Brand Name - Stacked */}
      <div className="flex flex-col items-start leading-none">
        <span
          className={cn(
            "font-serif font-semibold tracking-wide uppercase",
            sizes.line1,
            textColorClass,
            "transition-colors duration-300 group-hover:text-primary"
          )}
        >
          Dubai
        </span>
        <span
          className={cn(
            "font-serif font-medium tracking-[0.15em] uppercase",
            sizes.line2,
            textColorClass,
            "transition-colors duration-300 group-hover:text-primary"
          )}
        >
          Real Estate Investors
        </span>
      </div>

      {/* Gold Accent Line */}
      {showAccentLine && (
        <div
          className={cn(
            "h-px bg-primary mt-1",
            sizes.accentLine
          )}
        />
      )}

      {/* Tagline */}
      {showTagline && (
        <span
          className={cn(
            "uppercase tracking-[0.2em] text-primary font-sans mt-0.5",
            sizes.tagline
          )}
        >
          by Balcom Privé
        </span>
      )}
    </motion.div>
  );
}
