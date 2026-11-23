import { format } from 'date-fns';

/**
 * Formats a UTC ISO timestamp from PostgreSQL into the viewer's local browser timezone.
 */
export function formatLocalDateTime(utcIso: string, pattern = 'dd MMM yyyy • h:mm a'): string {
  const date = new Date(utcIso);
  if (Number.isNaN(date.getTime())) return 'Date TBA';

  const formatted = format(date, pattern);
  try {
    const tz = Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value;
    return tz ? `${formatted} (${tz})` : formatted;
  } catch {
    return formatted;
  }
}

/**
 * Converts a UTC ISO string from DB into local YYYY-MM-DDTHH:mm for <input type="datetime-local" />.
 */
export function utcToLocalInputValue(utcIso: string): string {
  const d = new Date(utcIso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Converts a local <input type="datetime-local" /> value into a UTC ISO string for the backend.
 */
export function localInputToUtcIso(localValue: string): string {
  return new Date(localValue).toISOString();
}
