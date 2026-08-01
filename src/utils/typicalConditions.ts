/**
 * Derive the "typical" delay and capacity for a given time-of-week from recorded
 * departure history. Used as the lowest-confidence fallback for car-wait risk
 * (and available for future delay smoothing) when there's no live signal.
 *
 * We match snapshots to a reference instant by weekday bucket (weekday vs
 * weekend — commute patterns cluster that way) and an hour window, then take a
 * trimmed mean so a single outlier sailing doesn't dominate a thin sample.
 */

import { DepartureSnapshot } from '../types/storage';

export interface TypicalConditions {
  capacityPercent: number | null;
  delayMinutes: number | null;
  sampleSize: number;
}

const EMPTY: TypicalConditions = { capacityPercent: null, delayMinutes: null, sampleSize: 0 };

function isWeekend(day: number): boolean {
  return day === 0 || day === 6;
}

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

/**
 * @param snapshots recorded departures (any window the caller fetched)
 * @param refDate   the instant to characterize (defaults to now)
 * @param hourWindow ± hours around refDate's hour to include (default 1)
 */
export function computeTypicalForSlot(
  snapshots: DepartureSnapshot[] | undefined,
  refDate: Date = new Date(),
  hourWindow = 1,
): TypicalConditions {
  if (!snapshots || snapshots.length === 0) return EMPTY;

  const refHour = refDate.getHours();
  const refWeekend = isWeekend(refDate.getDay());

  const matching = snapshots.filter((s) => {
    const d = new Date(s.scheduledTime);
    if (isWeekend(d.getDay()) !== refWeekend) return false;
    return Math.abs(d.getHours() - refHour) <= hourWindow;
  });

  if (matching.length === 0) return EMPTY;

  const capacities = matching.map((s) => s.capacityPercent).filter((c) => c > 0);
  const delays = matching.map((s) => s.delayMinutes);

  return {
    capacityPercent: capacities.length > 0 ? Math.round(trimmedMean(capacities)) : null,
    delayMinutes: Math.round(trimmedMean(delays)),
    sampleSize: matching.length,
  };
}
