/**
 * "Best sailing from here": given where you are right now, which terminal should
 * you drive to and which sailing can you realistically make?
 *
 * For each candidate route (one per route group — the departure terminal on
 * your side of the water), we estimate the drive, add the car buffer, find the
 * first sailing still catchable, push it back if cars are overflowing, then rank
 * the candidates by when you'd land on the far side.
 *
 * Pure and dependency-light so it can be unit-tested and later reused as the
 * data source for a CarPlay / Live Activity surface.
 */
import { Route } from "./constants";
import { effectiveFerryDeparture, FerryDepartureLike } from "./ferryDeparture";
import { addMinutes } from "./time";

export interface SailingLike extends FerryDepartureLike {
  isCancelled: boolean;
  mayRecover?: boolean;
}

export interface LatLon {
  lat: number;
  lon: number;
}

// `R` is the route id: the app's own Route, or any WSF pair id on the backend.
export interface SailingCandidate<T extends SailingLike, R extends string = Route> {
  route: R;
  terminalLabel: string;
  /** Straight-line distance from the user to the departure terminal. */
  distanceMeters: number;
  departures: T[];
  /** Minutes to arrive before departure (car holding / ticketing). */
  bufferMinutes: number;
  /** Car-overflow wait on the NEXT sailing (from carWait.ts). */
  carExtraSailings: number;
  /** Crossing time, for when the target sailing lands. */
  crossingMinutes: number;
}

export interface SailingPick<T extends SailingLike, R extends string = Route> {
  route: R;
  terminalLabel: string;
  driveMinutes: number;
  target: T;
  /** Departure time the plan is built against. */
  targetTime: Date;
  /** Latest time to start driving and still make `target`. */
  leaveBy: Date;
  /** Minutes until leaveBy (0 = go now). */
  slackMinutes: number;
  /** When the target sailing lands on the far side. */
  arrivalTime: Date;
  /** True when the first catchable boat is full for cars and we skipped it. */
  bumpedByOverflow: boolean;
  /** The sailing after the target — the fallback if you miss it. */
  following: T | null;
  reasoning: string[];
}

export interface BestSailingResult<T extends SailingLike, R extends string = Route> {
  best: SailingPick<T, R> | null;
  alternatives: SailingPick<T, R>[];
}

// Rough driving model until a native routing ETA (MKDirections) is wired in:
// Puget Sound roads wind around water, so straight-line distance understates the
// real route; average speed blends highway with town streets.
export const ROAD_DISTANCE_FACTOR = 1.4;
export const AVERAGE_DRIVE_KMH = 50;
export const DRIVE_OVERHEAD_MINUTES = 2;
// Already at (or in line at) the terminal.
export const AT_TERMINAL_METERS = 400;
// Beyond this drive a terminal isn't a sensible option.
export const MAX_DRIVE_MINUTES = 90;

export function estimateDriveMinutes(distanceMeters: number): number {
  if (distanceMeters <= AT_TERMINAL_METERS) return 0;
  const roadKm = (distanceMeters / 1000) * ROAD_DISTANCE_FACTOR;
  return Math.ceil((roadKm / AVERAGE_DRIVE_KMH) * 60) + DRIVE_OVERHEAD_MINUTES;
}

/**
 * Departure time to plan against. Evening "may recover" boats can leave on
 * schedule even when running late, so plan for the schedule there (missing the
 * boat is the expensive failure).
 */
function plannedDepartureTime(d: SailingLike): Date {
  return d.mayRecover ? d.scheduledDeparture : effectiveFerryDeparture(d).time;
}

export function planCandidate<T extends SailingLike, R extends string = Route>(
  c: SailingCandidate<T, R>,
  now: Date,
): SailingPick<T, R> | null {
  const driveMinutes = estimateDriveMinutes(c.distanceMeters);
  if (driveMinutes > MAX_DRIVE_MINUTES) return null;

  const upcoming = c.departures.filter(
    (d) => d.status !== "departed" && !d.isCancelled,
  );
  const earliestBoardMs = addMinutes(
    now,
    driveMinutes + c.bufferMinutes,
  ).getTime();
  let index = upcoming.findIndex(
    (d) => plannedDepartureTime(d).getTime() >= earliestBoardMs,
  );
  if (index === -1) return null;

  const reasoning = [
    driveMinutes === 0
      ? `At ${c.terminalLabel} terminal`
      : `~${driveMinutes} min drive to ${c.terminalLabel} + ${c.bufferMinutes} min buffer`,
  ];

  // Overflow is only known for the next boat; if that's the one we'd catch and
  // it's full for cars, plan for the one that will actually take us.
  let bumpedByOverflow = false;
  if (index === 0 && c.carExtraSailings > 0 && upcoming.length > 1) {
    index = Math.min(c.carExtraSailings, upcoming.length - 1);
    bumpedByOverflow = true;
    reasoning.push(
      `Next boat is likely full for cars — planning ${c.carExtraSailings} sailing${c.carExtraSailings !== 1 ? "s" : ""} later`,
    );
  }
  if (index > 0 && !bumpedByOverflow) {
    reasoning.push(
      `${index} earlier sailing${index !== 1 ? "s" : ""} leave${index === 1 ? "s" : ""} before you can get there`,
    );
  }

  const target = upcoming[index];
  const targetTime = plannedDepartureTime(target);
  const leaveBy = addMinutes(targetTime, -(driveMinutes + c.bufferMinutes));
  const slackMinutes = Math.max(
    0,
    Math.floor((leaveBy.getTime() - now.getTime()) / 60_000),
  );

  return {
    route: c.route,
    terminalLabel: c.terminalLabel,
    driveMinutes,
    target,
    targetTime,
    leaveBy,
    slackMinutes,
    arrivalTime: addMinutes(targetTime, c.crossingMinutes),
    bumpedByOverflow,
    following: upcoming[index + 1] ?? null,
    reasoning,
  };
}

/** Rank candidates by landing time on the far side; shorter drive breaks ties. */
export function pickBestSailing<T extends SailingLike, R extends string = Route>(
  candidates: SailingCandidate<T, R>[],
  now: Date,
): BestSailingResult<T, R> {
  const picks = candidates
    .map((c) => planCandidate(c, now))
    .filter((p): p is SailingPick<T, R> => p !== null)
    .sort(
      (a, b) =>
        a.arrivalTime.getTime() - b.arrivalTime.getTime() ||
        a.driveMinutes - b.driveMinutes,
    );
  return { best: picks[0] ?? null, alternatives: picks.slice(1) };
}
