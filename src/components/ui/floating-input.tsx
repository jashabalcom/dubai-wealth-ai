import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  showCharCount?: boolean;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, success, showCharCount, maxLength, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const prefersReducedMotion = useReducedMotion();
    const hasValue = value !== undefined && value !== "";
    const isFloating = isFocused || hasValue;
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="relative">
        <div className="relative">
          <input
            ref={ref}
            value={value}
            maxLength={maxLength}
            className={cn(
              "peer w-full rounded-md border bg-background px-3 pt-5 pb-2 text-sm",
              "transition-all duration-200",
              "placeholder-transparent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-destructive focus-visible:ring-destructive"
                : success
                ? "border-emerald-500 focus-visible:ring-emerald-500"
                : "border-input focus-visible:ring-ring",
              className
            )}
            placeholder={label}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          <motion.label
            className={cn(
              "absolute left-3 pointer-events-none origin-left",
              "transition-colors duration-200",
              error
                ? "text-destructive"
                : isFocused
                ? "text-primary"
                : "text-muted-foreground"
            )}
            initial={false}
            animate={{
              top: isFloating ? 6 : 14,
              scale: isFloating ? 0.75 : 1,
              x: 0,
            }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 25 }
            }
          >
            {label}
          </motion.label>
          
          {/* Success indicator */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <svg
                  className="w-5 h-5 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Character count */}
        {showCharCount && maxLength && (
          <div className="flex justify-end mt-1">
            <span
              className={cn(
                "text-xs transition-colors",
                charCount >= maxLength * 0.9
                  ? "text-destructive"
                  : charCount >= maxLength * 0.7
                  ? "text-amber-500"
                  : "text-muted-foreground"
              )}
            >
              {charCount}/{maxLength}
            </span>
          </div>
        )}

        {/* Error message with animation */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              className="text-xs text-destructive mt-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
