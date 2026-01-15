import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ConsentCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  showPrivacyLink?: boolean;
}

export function ConsentCheckbox({
  id,
  checked,
  onCheckedChange,
  label,
  required = false,
  error,
  className,
  showPrivacyLink = true,
}: ConsentCheckboxProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(checked) => onCheckedChange(checked === true)}
          className={cn(
            "mt-0.5 shrink-0",
            error && "border-destructive"
          )}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <Label
          htmlFor={id}
          className={cn(
            "text-sm text-muted-foreground leading-relaxed cursor-pointer font-normal",
            error && "text-destructive"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
          {showPrivacyLink && (
            <>
              {" "}
              <Link
                to="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </Link>
            </>
          )}
        </Label>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive ml-7">
          {error}
        </p>
      )}
    </div>
  );
}
