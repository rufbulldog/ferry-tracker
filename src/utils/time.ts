// Parse WSF date format: "/Date(1234567890000-0800)/" or regular date string/Date
export function parseDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;

  // If already a Date, validate it
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }

  // Handle WSF format: /Date(1234567890000-0800)/
  const wsfMatch = date.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
  if (wsfMatch) {
    const parsed = new Date(parseInt(wsfMatch[1], 10));
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // Handle regular date string
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function calculateDelayMinutes(
  scheduledDeparture: string | null,
  actualDeparture: string | null
): number {
  const scheduled = parseDate(scheduledDeparture);
  const actual = parseDate(actualDeparture);

  if (!scheduled || !actual) return 0;

  return Math.round((actual.getTime() - scheduled.getTime()) / 60_000);
}

export function formatTime(date: Date | string | null | undefined): string {
  const d = parseDate(date);
  if (!d) return '--:--';

  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getMinutesUntil(date: Date | string): number {
  const d = parseDate(date);
  if (!d) return 0;

  const now = new Date();
  return Math.round((d.getTime() - now.getTime()) / 60_000);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}
