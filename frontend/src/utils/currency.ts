export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  SGD: 'SG$',
  AED: 'AED ',
  JPY: '¥',
};

export function getCurrencySymbol(currencyCode: string = 'INR'): string {
  const code = (currencyCode || 'INR').toUpperCase();
  return CURRENCY_SYMBOLS[code] || code + ' ';
}

export function formatCurrency(amount: number, currencyCode: string = 'INR'): string {
  const symbol = getCurrencySymbol(currencyCode);
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `${symbol}${safeAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatConfidence(score: number): string {
  const pct = Math.round((isNaN(score) ? 1 : score) * 100);
  return `${pct}%`;
}
