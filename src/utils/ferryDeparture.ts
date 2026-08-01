/**
 * Single source of truth for a sailing's *effective* departure time and how
 * late it is. Both the Time card (crossed-out time) and the Leave card
 * ("N min behind schedule") previously derived these independently — the card
 * used `estimatedDeparture`, the Leave text used the stored `delayMinutes`, and
 * the two conditions didn't line up (e.g. an `arriving` boat showed a
 * crossed-out time but no "behind schedule"). Routing both through this pure
 * function keeps them consistent.
 *
 * These functions describe the FERRY's departure only. Car-specific wait
 * (missing a full boat) is layered on separately — see carWait.ts.
 */

export interface FerryDepartureLike {
  status: 'departed' | 'loading' | 'scheduled' | 'arriving' | 'returning';
  scheduledDeparture: Date;
  estimatedDeparture: Date | null;
  actualDeparture: Date | null;
}

export type DepartureBasis = 'actual' | 'estimated' | 'scheduled';

export interface EffectiveFerryDeparture {
  /** Best current estimate of when the boat departs (or actually did). */
  time: Date;
  /** Lateness vs the scheduled time, floored at 0 (never "early"). */
  delayMinutes: number;
  /** True once at least a full minute behind schedule. */
  isDelayed: boolean;
  basis: DepartureBasis;
}

function minutesBetween(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 60_000);
}

/**
 * Resolve the effective departure for a sailing. Preference order:
 *   1. It already left  → the actual leave-dock time.
 *   2. A later estimate → use it (a boat estimated to leave *before* schedule
 *      keeps the planned time; the schedule already budgets turnaround).
 *   3. Otherwise        → the scheduled time.
 */
export function effectiveFerryDeparture(d: FerryDepartureLike): EffectiveFerryDeparture {
  if (d.actualDeparture) {
    const delayMinutes = Math.max(0, minutesBetween(d.actualDeparture, d.scheduledDeparture));
    return { time: d.actualDeparture, delayMinutes, isDelayed: delayMinutes >= 1, basis: 'actual' };
  }

  if (d.estimatedDeparture && d.estimatedDeparture.getTime() > d.scheduledDeparture.getTime()) {
    const delayMinutes = Math.max(0, minutesBetween(d.estimatedDeparture, d.scheduledDeparture));
    return { time: d.estimatedDeparture, delayMinutes, isDelayed: delayMinutes >= 1, basis: 'estimated' };
  }

  return { time: d.scheduledDeparture, delayMinutes: 0, isDelayed: false, basis: 'scheduled' };
}

/**
 * Median gap (in minutes) between consecutive scheduled departures — the
 * "how long until the next boat" figure used to price a missed-sailing wait.
 * Uses the median so a single large gap (overnight, service break) doesn't skew
 * it. Returns `fallback` when there aren't at least two sailings to compare.
 */
export function deriveSailingIntervalMinutes(
  scheduledDepartures: Date[],
  fallback: number,
): number {
  const sorted = [...scheduledDepartures].sort((a, b) => a.getTime() - b.getTime());
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = minutesBetween(sorted[i], sorted[i - 1]);
    if (gap > 0) gaps.push(gap);
  }
  if (gaps.length === 0) return fallback;

  gaps.sort((a, b) => a - b);
  const mid = Math.floor(gaps.length / 2);
  return gaps.length % 2 === 0 ? Math.round((gaps[mid - 1] + gaps[mid]) / 2) : gaps[mid];
}
