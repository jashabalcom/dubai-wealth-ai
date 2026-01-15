import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, RefreshCw } from 'lucide-react';
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyCode } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface CurrencyPillProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function CurrencyPill({ className, variant = 'default' }: CurrencyPillProps) {
  const { selectedCurrency, setSelectedCurrency, loading, lastUpdated, getCurrencyInfo } = useCurrency();
  const [open, setOpen] = useState(false);
  
  const currentCurrency = getCurrencyInfo(selectedCurrency);

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Updating...';
    const diff = Date.now() - lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-3 h-9 rounded-full border transition-all duration-200",
            "hover:border-gold/50 hover:bg-gold/5 focus:outline-none focus:ring-2 focus:ring-gold/20",
            "text-sm font-medium",
            open ? "border-gold/50 bg-gold/5" : "border-border bg-background/50 backdrop-blur-sm",
            className
          )}
        >
          <span className="text-base leading-none">{currentCurrency?.flag}</span>
          {variant === 'default' && (
            <span className="text-foreground/80">{selectedCurrency}</span>
          )}
          <ChevronDown className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )} />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 p-1 bg-popover/95 backdrop-blur-md border-border"
        sideOffset={8}
      >
        <div className="px-3 py-2 border-b border-border mb-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Display Currency
          </p>
        </div>
        
        <div className="max-h-[280px] overflow-y-auto">
          {SUPPORTED_CURRENCIES.map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => setSelectedCurrency(currency.code)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md",
                "focus:bg-gold/10 focus:text-foreground",
                selectedCurrency === currency.code && "bg-gold/10"
              )}
            >
              <span className="text-lg">{currency.flag}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{currency.code}</p>
                <p className="text-xs text-muted-foreground">{currency.name}</p>
              </div>
              {selectedCurrency === currency.code && (
                <Check className="w-4 h-4 text-gold" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
          {loading ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
          <span>Live rates · {formatLastUpdated()}</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
