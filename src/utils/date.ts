/**
 * Formatea un timestamp (epoch ms) a fecha legible según el locale.
 */
export function formatDate(
  timestamp: number,
  locale: string = 'es-CL',
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(
    locale,
    options ?? {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  ).format(new Date(timestamp));
}

/**
 * Formatea un timestamp a fecha corta (día/mes/año).
 */
export function formatShortDate(timestamp: number, locale: string = 'es-CL'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp));
}

/**
 * Agrupa un timestamp por día (para agrupar transacciones).
 * Retorna "hoy", "ayer", o la fecha formateada.
 */
export function formatRelativeDay(timestamp: number, locale: string = 'es-CL'): string {
  const now = new Date();
  const date = new Date(timestamp);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);

  const relativeTerms: Record<string, Record<number, string>> = {
    es: { 0: 'Hoy', 1: 'Ayer' },
    en: { 0: 'Today', 1: 'Yesterday' },
  };

  const lang = locale.startsWith('es') ? 'es' : 'en';

  if (diffDays <= 1) {
    return relativeTerms[lang][diffDays] ?? formatShortDate(timestamp, locale);
  }
  return formatShortDate(timestamp, locale);
}

/**
 * Devuelve el nombre del mes.
 */
export function getMonthName(month: number, locale: string = 'es-CL'): string {
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, month, 1));
}
