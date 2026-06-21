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
 * Formats a number to Brazilian currency display: 1000 → "R$ 1.000,00"
 */
export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const fixed = abs.toFixed(2);
  const [reais, cents] = fixed.split('.');
  const withSeparators = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formatted = `R$ ${withSeparators},${cents}`;
  return value < 0 ? `- ${formatted}` : formatted;
}

const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const MONTHS_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

/**
 * Formats an ISO date string (YYYY-MM-DD) to Brazilian display: "15 de junho de 2026"
 */
export function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${String(d).padStart(2, '0')} de ${MONTHS[m - 1]} de ${y}`;
}

/**
 * Formats an ISO date string to short Brazilian: "15/06/2026"
 */
export function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

/**
 * Formats a Date object to "mes/ano": "jan/26"
 */
export function formatMonthShort(date: Date): string {
  return `${MONTHS_SHORT[date.getMonth()]}/${String(date.getFullYear()).slice(2)}`;
}

/**
 * Formats a Date object to "mês de ano": "junho de 2026"
 */
export function formatMonthLong(date: Date): string {
  return `${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}
