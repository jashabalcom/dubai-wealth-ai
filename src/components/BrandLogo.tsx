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
    line1: "text-[0.6rem] sm:text-[0.65rem] tracking-[0.35em] sm:tracking-[0.4em]",
    line2: "text-[0.45rem] sm:text-[0.5rem] tracking-[0.25em] sm:tracking-[0.35em]",
    accentLine: "w-6 sm:w-8",
    tagline: "text-[7px] sm:text-[8px] tracking-[0.15em] sm:tracking-[0.2em]",
    gap: "gap-0",
  },
  md: {
    line1: "text-xs sm:text-sm tracking-[0.4em] sm:tracking-[0.5em]",
    line2: "text-[0.5rem] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em]",
    accentLine: "w-10 sm:w-12",
    tagline: "text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.2em]",
    gap: "gap-0.5",
  },
  lg: {
    line1: "text-sm sm:text-base tracking-[0.5em]",
    line2: "text-xs sm:text-sm tracking-[0.4em]",
    accentLine: "w-12 sm:w-16",
    tagline: "text-[9px] sm:text-[10px] tracking-[0.2em]",
    gap: "gap-0.5 sm:gap-1",
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
      <div className="flex flex-col items-start leading-[1.1]">
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
            "font-serif font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase whitespace-nowrap",
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

      {/* Tagline - hidden on smallest screens, shown on medium+ */}
      {showTagline && (
        <span
          className={cn(
            "uppercase tracking-[0.2em] text-primary font-sans mt-1.5 hidden md:block",
            sizes.tagline
          )}
        >
          by Balcom Privé
        </span>
      )}
    </motion.div>
  );
}
