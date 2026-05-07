const currencyConfig: Record<string, { symbol: string; decimals: number }> = {
  CLP: { symbol: '$', decimals: 0 },
  USD: { symbol: 'US$', decimals: 2 },
  EUR: { symbol: '€', decimals: 2 },
  ARS: { symbol: 'AR$', decimals: 2 },
  BRL: { symbol: 'R$', decimals: 2 },
  MXN: { symbol: 'MX$', decimals: 2 },
  GBP: { symbol: '£', decimals: 2 },
  PEN: { symbol: 'S/', decimals: 2 },
  UYU: { symbol: '$U', decimals: 2 },
};

/**
 * Convierte un monto en unidades menores (centavos) a su representación decimal.
 */
export function minorToDecimal(amount: number, currency: string): number {
  const config = currencyConfig[currency] ?? { decimals: 2 };
  return amount / Math.pow(10, config.decimals);
}

/**
 * Convierte un monto decimal a unidades menores (centavos).
 */
export function decimalToMinor(amount: number, currency: string): number {
  const config = currencyConfig[currency] ?? { decimals: 2 };
  return Math.round(amount * Math.pow(10, config.decimals));
}

/**
 * Formatea un monto en unidades menores para mostrar en UI.
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = 'es-CL',
): string {
  const decimal = minorToDecimal(amount, currency);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: currencyConfig[currency]?.decimals ?? 2,
      maximumFractionDigits: currencyConfig[currency]?.decimals ?? 2,
    }).format(decimal);
  } catch {
    // Fallback si el locale no soporta la moneda
    const symbol = currencyConfig[currency]?.symbol ?? currency;
    const places = currencyConfig[currency]?.decimals ?? 2;
    return `${symbol} ${decimal.toFixed(places)}`;
  }
}

/**
 * Formatea un monto con el signo explícito (+ / -) basado en el tipo.
 */
export function formatSignedAmount(
  amount: number,
  currency: string,
  kind: 'income' | 'expense',
  locale?: string,
): string {
  const sign = kind === 'income' ? '+' : '-';
  return `${sign} ${formatCurrency(amount, currency, locale)}`;
}

/**
 * Obtiene el símbolo de una moneda.
 */
export function getCurrencySymbol(currency: string): string {
  return currencyConfig[currency]?.symbol ?? currency;
}

/**
 * Lista de monedas soportadas con su info.
 */
export function getSupportedCurrencies() {
  return Object.entries(currencyConfig).map(([code, config]) => ({
    code,
    ...config,
  }));
}
