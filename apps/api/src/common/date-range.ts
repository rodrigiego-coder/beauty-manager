/**
 * Timezone-aware date range helper for São Paulo (America/Sao_Paulo).
 *
 * Converts local SP dates into UTC Date objects so that Drizzle/Postgres
 * queries can use plain >= / < comparisons on "timestamp without time zone"
 * columns stored in UTC.
 *
 * Usage:
 *   const { start, end } = spDayToUtcRange('2026-02-07');
 *   // start = 2026-02-07T03:00:00.000Z  (00:00 SP = 03:00 UTC)
 *   // end   = 2026-02-08T03:00:00.000Z  (next day 00:00 SP)
 */

const SP_TZ = 'America/Sao_Paulo';

/**
 * Returns the current UTC offset in minutes for America/Sao_Paulo at a given instant.
 * Handles DST transitions automatically via Intl.
 * Returns a negative number (e.g. -180 for UTC-3, -120 for UTC-2 during DST).
 */
function getSpOffsetMinutes(refDate: Date): number {
  // Build a formatter that outputs only the GMT offset
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SP_TZ,
    timeZoneName: 'shortOffset',
  });
  const parts = fmt.formatToParts(refDate);
  const tzPart = parts.find((p) => p.type === 'timeZoneName');
  if (!tzPart) return -180; // safe fallback: UTC-3

  // tzPart.value is like "GMT-3" or "GMT-2"
  const match = tzPart.value.match(/GMT([+-]?\d+)(?::(\d+))?/);
  if (!match) return -180;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2] || '0', 10);
  return (hours * 60 + (hours < 0 ? -minutes : minutes));
}

/**
 * Converts a local SP midnight (00:00) of a given date to a UTC Date.
 * E.g. 2026-02-07 00:00 SP → 2026-02-07 03:00 UTC (when SP is UTC-3).
 */
export function spMidnightToUtc(year: number, month: number, day: number): Date {
  // Start with a rough UTC estimate (assuming -3)
  const rough = new Date(Date.UTC(year, month, day, 3, 0, 0));
  // Get the actual offset at that moment
  const offsetMin = getSpOffsetMinutes(rough);
  // SP midnight in UTC = 00:00 - offset = 00:00 + |offset|
  return new Date(Date.UTC(year, month, day, 0, -offsetMin, 0));
}

export interface UtcDateRange {
  start: Date; // inclusive
  end: Date;   // exclusive
}

/**
 * Given a date string "YYYY-MM-DD", returns [start, end) in UTC
 * where start = that day 00:00 SP and end = next day 00:00 SP.
 */
export function spDayToUtcRange(dateStr: string): UtcDateRange {
  const [y, m, d] = dateStr.split('-').map(Number);
  const start = spMidnightToUtc(y, m - 1, d);
  const end = spMidnightToUtc(y, m - 1, d + 1);
  return { start, end };
}

/**
 * Given a month (YYYY-MM or year+month), returns [start, end) in UTC
 * where start = 1st day 00:00 SP and end = 1st of next month 00:00 SP.
 */
export function spMonthToUtcRange(year: number, month: number): UtcDateRange {
  const start = spMidnightToUtc(year, month, 1); // month is 0-indexed
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const end = spMidnightToUtc(nextYear, nextMonth, 1);
  return { start, end };
}

/**
 * Returns "today" in SP timezone as [start, end) UTC range.
 */
export function spTodayUtcRange(): UtcDateRange {
  const now = new Date();
  // Get current date components in SP timezone
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: SP_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateStr = fmt.format(now); // "2026-02-07"
  return spDayToUtcRange(dateStr);
}

/**
 * Returns the current year/month/day in SP timezone.
 */
export function spNow(): { year: number; month: number; day: number; dayOfWeek: number } {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SP_TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  });
  const parts = fmt.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === 'year')!.value, 10);
  const month = parseInt(parts.find((p) => p.type === 'month')!.value, 10); // 1-indexed
  const day = parseInt(parts.find((p) => p.type === 'day')!.value, 10);

  // dayOfWeek: 0=Sun, 1=Mon ... 6=Sat (match JS convention)
  const weekdayStr = parts.find((p) => p.type === 'weekday')!.value;
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const dayOfWeek = dayMap[weekdayStr] ?? now.getDay();

  return { year, month, day, dayOfWeek };
}

/**
 * Parses a date string from a query parameter.
 * - If ISO with timezone (e.g. "2026-02-07T00:00:00-03:00") → respects it.
 * - If date-only "YYYY-MM-DD" → interprets as SP local midnight → UTC.
 */
export function parseQueryDate(dateStr: string, endOfDay = false): Date {
  // Check if it has time component (T) → treat as full ISO
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }
  // Date-only: interpret as SP local
  const range = spDayToUtcRange(dateStr);
  return endOfDay ? range.end : range.start;
}
