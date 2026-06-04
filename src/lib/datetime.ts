export function parseApiDate(value: string | null | undefined) {
  if (!value) return null;

  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? value.replace(' ', 'T') + 'Z'
    : value;

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const APP_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || 'Asia/Ho_Chi_Minh';
export const APP_TIMEZONE_LABEL = process.env.NEXT_PUBLIC_APP_TIMEZONE_LABEL || 'GMT+7';

export function formatAppDateTime(value: string | Date | null | undefined) {
  const date = value instanceof Date ? value : parseApiDate(value);
  if (!date) return '—';

  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return `${formatted} ${APP_TIMEZONE_LABEL}`;
}
