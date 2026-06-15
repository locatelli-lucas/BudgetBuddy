/**
 * Formats a raw numeric string into Brazilian currency display format.
 * Input is treated as cents: "1" → "0,01", "100" → "1,00", "1000" → "10,00"
 */
export function formatCurrencyInput(raw: string): string {
  // Remove all non-digit characters
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  // Pad to at least 3 digits so cents are always present
  const padded = digits.padStart(3, '0');
  const len = padded.length;

  // Split: everything except last 2 digits = reais, last 2 digits = cents
  const reais = padded.slice(0, len - 2);
  const cents = padded.slice(len - 2);

  // Remove leading zeros from reais (but keep at least one digit)
  const trimmedReais = reais.replace(/^0+/, '') || '0';

  // Add thousand separators (e.g. 1000 → 1.000)
  const formattedReais = trimmedReais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formattedReais},${cents}`;
}

/**
 * Parses a formatted currency string back to a float number.
 * "1,00" → 1.00, "0,50" → 0.50
 */
export function parseCurrencyInput(formatted: string): number {
  // Remove thousand separators, replace decimal comma with dot
  return parseFloat(formatted.replace(/\./g, '').replace(',', '.')) || 0;
}

/**
 * Formats a number to Brazilian currency display: 1000 → "1.000,00"
 */
export function formatCurrency(value: number): string {
  const fixed = value.toFixed(2);
  const [reais, cents] = fixed.split('.');
  const withSeparators = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${withSeparators},${cents}`;
}
