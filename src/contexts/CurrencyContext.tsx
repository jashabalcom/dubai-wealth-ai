import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const BASE_CURRENCY = 'AED';

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyContextType {
  selectedCurrency: CurrencyCode;
  setSelectedCurrency: (currency: CurrencyCode) => void;
  rates: ExchangeRates;
  loading: boolean;
  lastUpdated: Date | null;
  convert: (amountAED: number, toCurrency?: CurrencyCode) => number;
  formatPrice: (amountAED: number, options?: FormatOptions) => string;
  formatDualPrice: (amountAED: number) => { primary: string; secondary: string | null };
  getCurrencyInfo: (code: CurrencyCode) => typeof SUPPORTED_CURRENCIES[number] | undefined;
}

interface FormatOptions {
  abbreviate?: boolean;
  showSymbol?: boolean;
  currency?: CurrencyCode;
}

const LOCALE_CURRENCY_MAP: Record<string, CurrencyCode> = {
  'en-US': 'USD',
  'en-GB': 'GBP',
  'en-AU': 'AUD',
  'en-CA': 'CAD',
  'en-SG': 'SGD',
  'en-IN': 'INR',
  'hi-IN': 'INR',
  'de-DE': 'EUR',
  'fr-FR': 'EUR',
  'es-ES': 'EUR',
  'it-IT': 'EUR',
  'nl-NL': 'EUR',
  'zh-CN': 'CNY',
  'ja-JP': 'JPY',
  'de-CH': 'CHF',
  'fr-CH': 'CHF',
};

const FALLBACK_RATES: ExchangeRates = {
  USD: 0.2723,
  EUR: 0.2513,
  GBP: 0.2159,
  CAD: 0.3793,
  AUD: 0.4181,
  CHF: 0.2399,
  INR: 22.71,
  CNY: 1.9814,
  JPY: 40.82,
  SGD: 0.3653,
};

const STORAGE_KEY = 'dwh_preferred_currency';
const RATES_CACHE_KEY = 'dwh_exchange_rates';
const RATES_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function detectCurrencyFromLocale(): CurrencyCode {
  const locale = navigator.language;
  return LOCALE_CURRENCY_MAP[locale] || 'USD';
}

function getStoredCurrency(): CurrencyCode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_CURRENCIES.some(c => c.code === stored)) {
      return stored as CurrencyCode;
    }
  } catch {}
  return null;
}

function getCachedRates(): { rates: ExchangeRates; timestamp: number } | null {
  try {
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}
  return null;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyCode>(() => {
    return getStoredCurrency() || detectCurrencyFromLocale();
  });
  const [rates, setRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      // Check cache first
      const cached = getCachedRates();
      if (cached && Date.now() - cached.timestamp < RATES_CACHE_DURATION) {
        setRates(cached.rates);
        setLastUpdated(new Date(cached.timestamp));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        setRates(data.rates);
        setLastUpdated(new Date());
        
        // Cache the rates
        try {
          localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({
            rates: data.rates,
            timestamp: Date.now(),
          }));
        } catch {}
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setRates(FALLBACK_RATES);
      }
      setLoading(false);
    };

    fetchRates();
  }, []);

  const setSelectedCurrency = useCallback((currency: CurrencyCode) => {
    setSelectedCurrencyState(currency);
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch {}
  }, []);

  const convert = useCallback((amountAED: number, toCurrency: CurrencyCode = selectedCurrency): number => {
    if (!rates[toCurrency]) return amountAED;
    return amountAED * rates[toCurrency];
  }, [rates, selectedCurrency]);

  const formatPrice = useCallback((amountAED: number, options: FormatOptions = {}): string => {
    const { abbreviate = false, showSymbol = true, currency = selectedCurrency } = options;
    const converted = convert(amountAED, currency);
    const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency);
    
    let formatted: string;
    if (abbreviate) {
      if (converted >= 1000000) {
        formatted = `${(converted / 1000000).toFixed(1)}M`;
      } else if (converted >= 1000) {
        formatted = `${(converted / 1000).toFixed(0)}K`;
      } else {
        formatted = converted.toFixed(0);
      }
    } else {
      formatted = converted.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }

    if (showSymbol && currencyInfo) {
      return `${currencyInfo.symbol}${formatted}`;
    }
    return formatted;
  }, [convert, selectedCurrency]);

  const formatDualPrice = useCallback((amountAED: number): { primary: string; secondary: string | null } => {
    const primaryFormatted = `AED ${amountAED.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
    
    // Only show secondary if a non-AED currency is selected
    const secondary = formatPrice(amountAED, { abbreviate: amountAED >= 100000 });
    
    return {
      primary: primaryFormatted,
      secondary,
    };
  }, [formatPrice]);

  const getCurrencyInfo = useCallback((code: CurrencyCode) => {
    return SUPPORTED_CURRENCIES.find(c => c.code === code);
  }, []);

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setSelectedCurrency,
      rates,
      loading,
      lastUpdated,
      convert,
      formatPrice,
      formatDualPrice,
      getCurrencyInfo,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
