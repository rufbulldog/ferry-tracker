/**
 * Typical measured crossing time for a route, derived from recorded history.
 *
 * Crossing duration is route-stable (weather/tide aside), so we pool all recent
 * measured crossings for the route rather than bucketing by weekday/hour the way
 * delay/capacity are bucketed. Only rows the collector has filled in with a
 * measured `crossingMinutes` (actual arrival − actual departure) count.
 */
import { DepartureSnapshot } from '../types/storage';
import { Route } from './constants';

export interface TypicalCrossing {
  minutes: number | null;
  sampleSize: number;
}

const EMPTY: TypicalCrossing = { minutes: null, sampleSize: 0 };

// Same trimmed mean as typicalConditions.ts — drops the top/bottom 10% once the
// sample is large enough so one anomalous crossing doesn't skew a thin history.
function trimmedMean(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length < 4) {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const trim = Math.floor(sorted.length * 0.1);
  const kept = sorted.slice(trim, sorted.length - trim);
  return kept.reduce((a, b) => a + b, 0) / kept.length;
}

export function typicalCrossingMinutes(
  snapshots: DepartureSnapshot[] | undefined,
  route: Route,
): TypicalCrossing {
  if (!snapshots || snapshots.length === 0) return EMPTY;

  const crossings = snapshots
    .filter((s) => s.route === route && s.crossingMinutes != null)
    .map((s) => s.crossingMinutes as number)
    .filter((m) => m > 0);

  if (crossings.length === 0) return EMPTY;

  return { minutes: Math.round(trimmedMean(crossings)), sampleSize: crossings.length };
}
