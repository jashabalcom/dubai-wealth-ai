import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SuccessAnimationProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showConfetti?: boolean;
}

export function SuccessAnimation({
  size = "md",
  className,
  showConfetti = false,
}: SuccessAnimationProps) {
  const prefersReducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const strokeWidth = {
    sm: 3,
    md: 2.5,
    lg: 2,
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Circle background */}
      <motion.div
        className={cn(
          "rounded-full bg-emerald-500/20 flex items-center justify-center",
          sizeClasses[size]
        )}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 300, damping: 20 }
        }
      >
        {/* Checkmark SVG */}
        <svg
          className={cn("text-emerald-500", sizeClasses[size])}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth[size]}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.4, delay: 0.2, ease: "easeOut" }
            }
          />
        </svg>
      </motion.div>

      {/* Confetti particles */}
      {showConfetti && !prefersReducedMotion && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: [
                  "hsl(35 25% 70%)",
                  "hsl(142 76% 36%)",
                  "hsl(35 30% 80%)",
                  "hsl(220 40% 8%)",
                ][i % 4],
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI) / 4) * 40,
                y: Math.sin((i * Math.PI) / 4) * 40,
              }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {/* Ripple effect */}
      {!prefersReducedMotion && (
        <motion.div
          className={cn(
            "absolute rounded-full border-2 border-emerald-500/50",
            sizeClasses[size]
          )}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}
    </div>
  );
}
