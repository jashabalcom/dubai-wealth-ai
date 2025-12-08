import { ChevronDown } from 'lucide-react';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  supportedCurrencies: string[];
}

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  INR: '₹',
  CNY: '¥',
  JPY: '¥',
  SGD: 'S$',
};

const currencyNames: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
  INR: 'Indian Rupee',
  CNY: 'Chinese Yuan',
  JPY: 'Japanese Yen',
  SGD: 'Singapore Dollar',
};

export function CurrencySelector({ 
  selectedCurrency, 
  onCurrencyChange, 
  supportedCurrencies 
}: CurrencySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Convert to:</span>
      <div className="relative">
        <select
          value={selectedCurrency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="h-9 pl-3 pr-8 rounded-lg border border-input bg-background text-sm appearance-none cursor-pointer hover:border-gold/50 transition-colors"
        >
          {supportedCurrencies.map((currency) => (
            <option key={currency} value={currency}>
              {currencySymbols[currency]} {currency}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
