import { useState, useEffect } from 'react';

const BASE_CURRENCY = 'AED';
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'INR', 'CNY', 'JPY', 'SGD'];

interface ExchangeRates {
  [key: string]: number;
}

export function useCurrencyConverter() {
  const [rates, setRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      // Using exchangerate-api (free tier)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      setRates(data.rates);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
      // Fallback rates if API fails
      setRates({
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
      });
      setError('Using cached rates');
      setLoading(false);
    }
  };

  const convert = (amountAED: number, toCurrency: string = selectedCurrency): number => {
    if (!rates[toCurrency]) return amountAED;
    return amountAED * rates[toCurrency];
  };

  const formatCurrency = (amountAED: number, toCurrency: string = selectedCurrency): string => {
    const converted = convert(amountAED, toCurrency);
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: toCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(converted);
  };

  const formatAED = (amount: number): string => {
    return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return {
    rates,
    loading,
    error,
    selectedCurrency,
    setSelectedCurrency,
    convert,
    formatCurrency,
    formatAED,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  };
}
