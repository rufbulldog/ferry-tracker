/**
 * Per-sailing history for the Trends tab: how late and how full each scheduled
 * departure (the 7:55, the 8:45, …) usually runs, plus a sailing × day grid.
 *
 * Commuters ride a specific sailing, so we bucket by scheduled clock time rather
 * than by hour, and split weekdays from weekends the same way
 * typicalConditions.ts does (the schedules and crowds differ). Typical values
 * use the same trimmed mean so these numbers match the Ferry tab's fallbacks.
 */

import { DepartureSnapshot } from '../types/storage';
import { trimmedMean } from './typicalConditions';

export type DayType = 'weekday' | 'weekend';

// A departure within this many minutes of schedule counts as on time.
export const ON_TIME_MAX_MINUTES = 3;
// At or above this it's "very late" in the grid.
export const VERY_LATE_MINUTES = 10;

export type DelayBand = 'onTime' | 'late' | 'veryLate';

export function delayBand(delayMinutes: number): DelayBand {
  if (delayMinutes >= VERY_LATE_MINUTES) return 'veryLate';
  if (delayMinutes > ON_TIME_MAX_MINUTES) return 'late';
  return 'onTime';
}

export function dayTypeOf(date: Date): DayType {
  const d = date.getDay();
  return d === 0 || d === 6 ? 'weekend' : 'weekday';
}

/** Minutes after local midnight of a snapshot's scheduled departure. */
export function sailingMinute(scheduledTime: string): number {
  const d = new Date(scheduledTime);
  return d.getHours() * 60 + d.getMinutes();
}

// The ferry service day runs past midnight; sailings before this belong to the
// end of the previous day's list, not the top of it.
const SERVICE_DAY_START_MINUTE = 3 * 60;

/** Sort key that puts after-midnight sailings at the end of the day. */
export function serviceOrder(minuteOfDay: number): number {
  return minuteOfDay < SERVICE_DAY_START_MINUTE ? minuteOfDay + 24 * 60 : minuteOfDay;
}

/** "7:55 AM", "12:10 PM" — matches the Ferry tab's times. */
export function sailingLabel(minuteOfDay: number): string {
  const h = Math.floor(minuteOfDay / 60);
  const m = minuteOfDay % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface SailingSummary {
  minuteOfDay: number;
  label: string;
  sampleSize: number;
  typicalDelay: number;
  /** Share of departures within ON_TIME_MAX_MINUTES, 0–100. */
  onTimePercent: number;
  /** Typical drive-up fill, 0–100, or null when no capacity was recorded. */
  typicalCapacity: number | null;
}

/** One row per scheduled sailing time for the given day type, in service-day order. */
export function summarizeSailings(
  snapshots: DepartureSnapshot[] | undefined,
  dayType: DayType,
): SailingSummary[] {
  if (!snapshots || snapshots.length === 0) return [];

  const bySlot = new Map<number, DepartureSnapshot[]>();
  for (const s of snapshots) {
    if (dayTypeOf(new Date(s.scheduledTime)) !== dayType) continue;
    const key = sailingMinute(s.scheduledTime);
    const list = bySlot.get(key);
    if (list) list.push(s);
    else bySlot.set(key, [s]);
  }

  const out: SailingSummary[] = [];
  bySlot.forEach((items, minuteOfDay) => {
    const delays = items.map((s) => s.delayMinutes);
    const capacities = items.map((s) => s.capacityPercent).filter((c) => c > 0);
    const onTime = delays.filter((d) => d <= ON_TIME_MAX_MINUTES).length;
    out.push({
      minuteOfDay,
      label: sailingLabel(minuteOfDay),
      sampleSize: items.length,
      typicalDelay: Math.round(trimmedMean(delays)),
      onTimePercent: Math.round((onTime / items.length) * 100),
      typicalCapacity: capacities.length > 0 ? Math.round(trimmedMean(capacities)) : null,
    });
  });

  return out.sort((a, b) => serviceOrder(a.minuteOfDay) - serviceOrder(b.minuteOfDay));
}

/**
 * The sailing a summary list should open on: the first one at or after
 * `preferredMinute` (the Ferry tab's next boat), else the last of the day.
 */
export function pickSailing(sailings: SailingSummary[], preferredMinute: number): SailingSummary | null {
  if (sailings.length === 0) return null;
  const pref = serviceOrder(preferredMinute);
  return sailings.find((s) => serviceOrder(s.minuteOfDay) >= pref) ?? sailings[sailings.length - 1];
}

/**
 * Up to `size` consecutive items centred on the one matching `minuteOfDay`, so a
 * long schedule opens on the sailings around yours.
 */
export function windowAround<T extends { minuteOfDay: number }>(items: T[], minuteOfDay: number | undefined, size: number): T[] {
  if (items.length <= size) return items;
  const idx = Math.max(0, items.findIndex((i) => i.minuteOfDay === minuteOfDay));
  const start = Math.min(Math.max(0, idx - Math.floor(size / 2)), items.length - size);
  return items.slice(start, start + size);
}

export interface GridCell {
  delayMinutes: number;
  capacityPercent: number | null;
}

export interface ReliabilityGrid {
  /** Service dates (YYYY-MM-DD, local), oldest first. */
  days: string[];
  rows: { minuteOfDay: number; label: string; cells: (GridCell | null)[] }[];
}

/**
 * Sailing × day grid over the most recent `maxDays` dates of this day type that
 * have any recorded departure. A null cell means no snapshot for that sailing.
 */
export function buildReliabilityGrid(
  snapshots: DepartureSnapshot[] | undefined,
  dayType: DayType,
  maxDays = 10,
): ReliabilityGrid {
  if (!snapshots || snapshots.length === 0) return { days: [], rows: [] };

  const matching = snapshots.filter((s) => dayTypeOf(new Date(s.scheduledTime)) === dayType);
  const allDays = Array.from(new Set(matching.map((s) => localDateKey(new Date(s.scheduledTime))))).sort();
  const days = allDays.slice(-maxDays);
  const dayIndex = new Map(days.map((d, i) => [d, i]));

  const rows = new Map<number, (GridCell | null)[]>();
  for (const s of matching) {
    const col = dayIndex.get(localDateKey(new Date(s.scheduledTime)));
    if (col === undefined) continue;
    const key = sailingMinute(s.scheduledTime);
    let cells = rows.get(key);
    if (!cells) {
      cells = Array<GridCell | null>(days.length).fill(null);
      rows.set(key, cells);
    }
    cells[col] = {
      delayMinutes: s.delayMinutes,
      capacityPercent: s.capacityPercent > 0 ? s.capacityPercent : null,
    };
  }

  return {
    days,
    rows: Array.from(rows.entries())
      .sort((a, b) => serviceOrder(a[0]) - serviceOrder(b[0]))
      .map(([minuteOfDay, cells]) => ({ minuteOfDay, label: sailingLabel(minuteOfDay), cells })),
  };
}
