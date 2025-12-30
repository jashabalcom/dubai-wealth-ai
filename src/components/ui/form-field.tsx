import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Label } from "./label";
import { CheckCircle2 } from "lucide-react";

interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  success?: boolean;
  className?: string;
}

export function FormField({
  children,
  label,
  htmlFor,
  error,
  helperText,
  required,
  success,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center gap-2">
          <Label
            htmlFor={htmlFor}
            className={cn(
              "transition-colors duration-200",
              error && "text-destructive",
              success && "text-emerald-500"
            )}
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-hidden="true">
                *
              </span>
            )}
          </Label>
          
          {/* Success indicator */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {children}

      {/* Error message with slide animation */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-destructive"
            role="alert"
          >
            {error}
          </motion.p>
        ) : helperText ? (
          <motion.p
            key="helper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground"
          >
            {helperText}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
