import { format, formatDistanceToNow, isValid } from 'date-fns';

/**
 * Safely parses any date string or Date object.
 */
export function parseDate(date?: Date | string | null): Date | null {
  if (!date) return null;
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return isValid(parsed) ? parsed : null;
}

/**
 * Formats a date into a standard display string.
 * @default formatStr 'dd MMM yyyy h:mm a' (e.g. "12 Oct 2026 6:30 PM")
 */
export function formatDate(
  date?: Date | string | null,
  formatStr: string = 'dd MMM yyyy h:mm a'
): string {
  const d = parseDate(date);
  if (!d) return '';
  try {
    return format(d, formatStr);
  } catch {
    return '';
  }
}

/**
 * Formats only the date portion (e.g. "12 Oct 2026").
 */
export function formatDateOnly(date?: Date | string | null): string {
  return formatDate(date, 'dd MMM yyyy');
}

/**
 * Formats only the time portion (e.g. "6:30 PM").
 */
export function formatTimeOnly(date?: Date | string | null): string {
  return formatDate(date, 'h:mm a');
}

/**
 * Formats a date as relative distance from now (e.g. "2 hours ago", "in 3 days").
 */
export function formatRelativeTime(date?: Date | string | null): string {
  const d = parseDate(date);
  if (!d) return '';
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
}
