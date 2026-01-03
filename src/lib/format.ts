/**
 * Format a number as AED currency
 */
export function formatCurrency(value: number, options?: { compact?: boolean }): string {
  if (options?.compact) {
    if (value >= 1_000_000_000) {
      return `AED ${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `AED ${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `AED ${(value / 1_000).toFixed(0)}K`;
    }
  }
  
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-AE').format(value);
}

/**
 * Format a date
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-AE', options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
