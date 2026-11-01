/**
 * Commute legs the Timer records, and the per-leg numbers its screens show:
 * the typical time (same estimator the Ferry tab's leave-by uses), the last
 * ride, and live pace against the typical while a ride is being timed.
 */

import { TransitRecord, TransitRoute, Vehicle } from '../types/storage';
import { Route } from './constants';
import { computeTypicalTransitSeconds } from './transitStats';

export type TimerLegId =
  | 'bi-home-to-ferry'
  | 'bi-ferry-to-work'
  | 'bi-work-to-ferry'
  | 'bi-ferry-to-home'
  | 'kingston-home-to-ferry';

export type LegPeriod = 'morning' | 'evening';

export interface TimerLeg {
  id: TimerLegId;
  label: string;
  storageRoute: TransitRoute;
  vehicles: Vehicle[];
  period: LegPeriod;
  /** Ferry route this leg ends at the start of, for the "on pace for" footer. */
  catchesRoute: Route | null;
  /** Which Ferry-tab number this leg's typical feeds. */
  feeds: string;
}

export const TIMER_LEGS: TimerLeg[] = [
  { id: 'bi-home-to-ferry', label: 'Home → Bainbridge ferry', storageRoute: 'home-to-ferry', vehicles: ['bike', 'car'], period: 'morning', catchesRoute: 'bainbridge-seattle', feeds: 'Leave in' },
  { id: 'bi-ferry-to-work', label: 'Seattle dock → Work', storageRoute: 'ferry-to-work', vehicles: ['bike'], period: 'morning', catchesRoute: null, feeds: 'At office by' },
  { id: 'kingston-home-to-ferry', label: 'Home → Kingston ferry', storageRoute: 'home-to-ferry', vehicles: ['car'], period: 'morning', catchesRoute: 'kingston-edmonds', feeds: 'Leave in' },
  { id: 'bi-work-to-ferry', label: 'Work → Seattle ferry', storageRoute: 'work-to-ferry', vehicles: ['bike'], period: 'evening', catchesRoute: 'seattle-bainbridge', feeds: 'Leave in' },
  { id: 'bi-ferry-to-home', label: 'Bainbridge dock → Home', storageRoute: 'ferry-to-home', vehicles: ['bike'], period: 'evening', catchesRoute: null, feeds: 'Home by' },
];

export function getLeg(id: TimerLegId): TimerLeg {
  return TIMER_LEGS.find((l) => l.id === id) ?? TIMER_LEGS[0];
}

/** Label for a saved record. Car home→ferry is shared by Bainbridge and Kingston. */
export function recordLabel(route: TransitRoute, vehicle: Vehicle): string {
  switch (route) {
    case 'home-to-ferry':
      return vehicle === 'car' ? 'Home → ferry' : 'Home → Bainbridge ferry';
    case 'ferry-to-work':
      return 'Seattle dock → Work';
    case 'work-to-ferry':
      return 'Work → Seattle ferry';
    case 'ferry-to-home':
      return 'Bainbridge dock → Home';
  }
}

export interface LegStats {
  typicalSeconds: number | null;
  rides: number;
  last: TransitRecord | null;
}

export function legStats(records: TransitRecord[] | undefined, route: TransitRoute, vehicle: Vehicle): LegStats {
  const matching = (records ?? []).filter((r) => r.route === route && r.vehicle === vehicle);
  const typical = computeTypicalTransitSeconds(matching);
  let last: TransitRecord | null = null;
  for (const r of matching) {
    if (!last || new Date(r.timestamp).getTime() > new Date(last.timestamp).getTime()) last = r;
  }
  return {
    typicalSeconds: typical ? Math.round(typical.seconds) : null,
    rides: matching.length,
    last,
  };
}

/** Morning legs before noon, evening after — the leg list opens on the current half. */
export function currentPeriod(now: Date = new Date()): LegPeriod {
  return now.getHours() < 12 ? 'morning' : 'evening';
}

export interface Pace {
  /** Elapsed as a share of typical, 0–100 (capped). */
  percent: number;
  /** typical − elapsed; negative once over. */
  remainingSeconds: number;
}

export function paceAgainstTypical(elapsedSeconds: number, typicalSeconds: number): Pace {
  const percent = typicalSeconds > 0 ? Math.min(100, (elapsedSeconds / typicalSeconds) * 100) : 0;
  return { percent, remainingSeconds: typicalSeconds - elapsedSeconds };
}

/**
 * The first departure you'd make if you arrive in `remainingSeconds` (never
 * sooner than now), and how many minutes you'd have to spare.
 */
export function sailingOnPaceFor(
  departures: Date[],
  remainingSeconds: number,
  now: Date = new Date(),
): { departure: Date; arrive: Date; spareMinutes: number } | null {
  const arrive = new Date(now.getTime() + Math.max(0, remainingSeconds) * 1000);
  const next = departures
    .filter((d) => d.getTime() >= arrive.getTime())
    .sort((a, b) => a.getTime() - b.getTime())[0];
  if (!next) return null;
  return { departure: next, arrive, spareMinutes: Math.floor((next.getTime() - arrive.getTime()) / 60000) };
}

/** "7:45" for seconds, "1:02:10" past an hour. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** "8m 23s", "1h 2m" — for lists, where m:ss could be mistaken for a clock time. */
export function formatMinSec(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}
