import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

interface DualPriceProps {
  amountAED: number;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  showSecondary?: boolean;
  abbreviate?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  suffix?: string;
}

export function DualPrice({ 
  amountAED, 
  className,
  primaryClassName,
  secondaryClassName,
  showSecondary = true,
  abbreviate = false,
  size = 'md',
  suffix,
}: DualPriceProps) {
  const { formatDualPrice, formatPrice, selectedCurrency } = useCurrency();

  // Format AED price
  const formatAED = (amount: number, abbrev: boolean): string => {
    if (abbrev) {
      if (amount >= 1000000) {
        return `AED ${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `AED ${Math.round(amount / 1000)}K`;
      }
    }
    return `AED ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const primary = formatAED(amountAED, abbreviate);
  const secondary = formatPrice(amountAED, { abbreviate: abbreviate || amountAED >= 100000 });

  const sizeClasses = {
    sm: {
      primary: 'text-sm font-medium',
      secondary: 'text-xs',
    },
    md: {
      primary: 'text-base font-semibold',
      secondary: 'text-sm',
    },
    lg: {
      primary: 'text-xl font-semibold',
      secondary: 'text-base',
    },
    xl: {
      primary: 'text-3xl font-heading',
      secondary: 'text-lg',
    },
  };

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn(sizeClasses[size].primary, "text-gold", primaryClassName)}>
        {primary}{suffix}
      </span>
      {showSecondary && (
        <span className={cn(
          sizeClasses[size].secondary,
          "text-muted-foreground",
          secondaryClassName
        )}>
          ≈ {secondary}
        </span>
      )}
    </span>
  );
}

// Compact inline version for tables/lists
export function InlinePrice({ 
  amountAED, 
  className,
  abbreviate = true,
}: { 
  amountAED: number; 
  className?: string;
  abbreviate?: boolean;
}) {
  const { formatPrice } = useCurrency();

  const formatAED = (amount: number): string => {
    if (abbreviate) {
      if (amount >= 1000000) {
        return `AED ${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `AED ${Math.round(amount / 1000)}K`;
      }
    }
    return `AED ${amount.toLocaleString()}`;
  };

  const secondary = formatPrice(amountAED, { abbreviate: true });

  return (
    <span className={cn("text-sm", className)}>
      <span className="font-medium text-foreground">{formatAED(amountAED)}</span>
      <span className="text-muted-foreground ml-1.5">({secondary})</span>
    </span>
  );
}
