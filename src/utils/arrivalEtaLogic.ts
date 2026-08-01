/**
 * Pure functions that implement the ETA selection and departure-basis logic.
 * Extracted from useArrivalEta.ts so they can be unit-tested without pulling
 * in React, React Native, or any network/hook dependencies.
 */

import { addMinutes, parseDate } from './time';
import { FERRY_CROSSING_MINUTES } from './constants';

// ---- Type-only import (DepartureInfo is defined in useNextDepartures.ts).
// We re-declare only the fields these functions actually touch so this module
// stays dependency-free and testable in a plain Node environment.
export interface DepartureLike {
  status: 'departed' | 'loading' | 'scheduled' | 'arriving' | 'returning';
  isCancelled: boolean;
  actualDeparture: Date | null;
  scheduledDeparture: Date;
  vesselArrivalEta: Date | null;
  vessel: { LeftDock: string | null } | null;
}

// Minimum flip time once a vessel docks *after* its scheduled departure (i.e. it's
// genuinely late). Mirrors MIN_TURNAROUND_MINUTES in useNextDepartures.ts.
export const MIN_TURNAROUND_MINUTES = 5;

// Window after a ferry pulls away during which hitting "Send ETA" almost certainly
// means you're aboard the boat that just left — not waiting for the next one.
const JUST_LEFT_MINUTES = 5;

/**
 * The sailing the ETA is for. Normally the next sailing you'd board — the one
 * shown on the "Next Sailing" card (first that hasn't departed). The exception:
 * if a ferry pulled away from the dock just now (≤JUST_LEFT_MINUTES), that's
 * the boat you just boarded, so use it instead of jumping to the next sailing.
 *
 * A boat already well into its crossing is a *prior* sailing and must not
 * hijack the ETA from the next sailing you're about to board.
 */
export function selectActiveDeparture<T extends DepartureLike>(
  departures: T[] | undefined
): T | null {
  if (!departures || departures.length === 0) return null;

  const nowMs = Date.now();

  const justLeft = departures
    .filter(
      d =>
        d.status === 'departed' &&
        !d.isCancelled &&
        d.actualDeparture != null &&
        nowMs - d.actualDeparture.getTime() >= 0 &&
        nowMs - d.actualDeparture.getTime() <= JUST_LEFT_MINUTES * 60_000,
    )
    .sort((a, b) => b.actualDeparture!.getTime() - a.actualDeparture!.getTime());
  if (justLeft.length > 0) return justLeft[0];

  // A boat physically loading at our dock is almost certainly the one you're
  // boarding — prefer it over a first-listed sailing whose assigned vessel is
  // still `arriving`/`returning` (whose projected time overshoots reality).
  const loading = departures.filter(d => d.status === 'loading' && !d.isCancelled);
  if (loading.length > 0) {
    return loading.sort((a, b) => a.scheduledDeparture.getTime() - b.scheduledDeparture.getTime())[0];
  }

  return departures.find(d => d.status !== 'departed' && !d.isCancelled) ?? null;
}

/**
 * Projected time the assigned vessel reaches the departure dock.
 * Returns vesselArrivalEta if set; else if status=loading and vessel.LeftDock
 * is set, returns LeftDock + FERRY_CROSSING_MINUTES; else null.
 */
export function projectedDockTime<T extends DepartureLike>(d: T): Date | null {
  if (d.vesselArrivalEta) return d.vesselArrivalEta;
  if (d.status === 'loading' && d.vessel?.LeftDock) {
    const leftFarSide = parseDate(d.vessel.LeftDock);
    if (leftFarSide) return addMinutes(leftFarSide, FERRY_CROSSING_MINUTES);
  }
  return null;
}

/**
 * The departure time the ETA is built from, kept deliberately *conservative*
 * so it doesn't jump around during the loading→departed transition:
 *   • once the boat has left, use the actual leave-dock time;
 *   • a boat still loading past its scheduled time is genuinely late and about
 *     to leave — use `now`;
 *   • otherwise use the planned (scheduled) departure.
 *
 * Notably it does NOT fold in the `arriving`/`returning` vessel projection.
 * That projection (opposite-terminal schedule + crossing + turnaround) routinely
 * overshoots the boat you're actually boarding and produced ETAs an hour late
 * until the boat physically left. The pin/check-in flow keeps this locked to the
 * boat you're on. `projectedDockTime` remains exported for display-only use.
 */
export function etaDepartureBasis<T extends DepartureLike>(d: T, nowMs: number = Date.now()): Date {
  if (d.actualDeparture) return d.actualDeparture;

  if (d.status === 'loading' && nowMs > d.scheduledDeparture.getTime()) {
    return new Date(nowMs);
  }

  return d.scheduledDeparture;
}
