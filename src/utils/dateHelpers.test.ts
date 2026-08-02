import { toYMD, addDays, isSameDay, daysBetween, startOfDay, formatDayLabel, formatMonthLabel } from './dateHelpers';

describe('dateHelpers', () => {
  test('toYMD formats local date parts, zero-padded', () => {
    expect(toYMD(new Date(2026, 7, 5))).toBe('2026-08-05'); // month is 0-indexed → Aug
    expect(toYMD(new Date(2026, 11, 31))).toBe('2026-12-31');
    expect(toYMD(new Date(2026, 0, 1))).toBe('2026-01-01');
  });

  test('addDays crosses month boundaries', () => {
    expect(toYMD(addDays(new Date(2026, 7, 30), 3))).toBe('2026-09-02');
    expect(toYMD(addDays(new Date(2026, 0, 1), -1))).toBe('2025-12-31');
  });

  test('isSameDay ignores time of day', () => {
    expect(isSameDay(new Date(2026, 7, 5, 6, 0), new Date(2026, 7, 5, 23, 59))).toBe(true);
    expect(isSameDay(new Date(2026, 7, 5), new Date(2026, 7, 6))).toBe(false);
  });

  test('daysBetween is date-only and signed', () => {
    expect(daysBetween(new Date(2026, 7, 5, 23), new Date(2026, 7, 8, 1))).toBe(3);
    expect(daysBetween(new Date(2026, 7, 8), new Date(2026, 7, 5))).toBe(-3);
  });

  test('startOfDay zeroes the time', () => {
    const s = startOfDay(new Date(2026, 7, 5, 14, 30, 15));
    expect(s.getHours()).toBe(0);
    expect(s.getMinutes()).toBe(0);
  });

  test('formatDayLabel renders "Weekday, Month Day"', () => {
    expect(formatDayLabel(new Date(2026, 7, 10))).toBe('Mon, Aug 10');
    expect(formatDayLabel(new Date(2026, 0, 1))).toBe('Thu, Jan 1');
  });

  test('formatMonthLabel renders "Month Year"', () => {
    expect(formatMonthLabel(new Date(2026, 7, 10))).toBe('August 2026');
    expect(formatMonthLabel(new Date(2026, 11, 1))).toBe('December 2026');
  });
});
