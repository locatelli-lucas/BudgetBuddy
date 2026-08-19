/**
 * Formats a date or string into a localized relative time (e.g., "há 2 minutos", "há 3 dias").
 * Manual implementation to avoid Intl.RelativeTimeFormat which is not supported by Hermes.
 */
export function formatRelativeTime(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? 'há 1 minuto' : `há ${diffInMinutes} minutos`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? 'há 1 hora' : `há ${diffInHours} horas`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return diffInDays === 1 ? 'há 1 dia' : `há ${diffInDays} dias`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? 'há 1 mês' : `há ${diffInMonths} meses`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return diffInYears === 1 ? 'há 1 ano' : `há ${diffInYears} anos`;
}

/**
 * Formats a date into a "smart" localized string (e.g., "Hoje", "Ontem" or "22 de Jun").
 */
export function formatSmartDate(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Hoje';
  if (isYesterday) return 'Ontem';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}
