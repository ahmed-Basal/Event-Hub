import { format, formatDistanceToNow, isValid } from 'date-fns';

export function parseDate(date?: Date | string | null): Date | null {
  if (!date) return null;
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return isValid(parsed) ? parsed : null;
}

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

export function formatDateOnly(date?: Date | string | null): string {
  return formatDate(date, 'dd MMM yyyy');
}

export function formatTimeOnly(date?: Date | string | null): string {
  return formatDate(date, 'h:mm a');
}

export function formatRelativeTime(date?: Date | string | null): string {
  const d = parseDate(date);
  if (!d) return '';
  try {
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
}
