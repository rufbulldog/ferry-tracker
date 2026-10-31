/**
 * Pure arrival-ETA math: ferry departure → ferry arrival → door. Shared by the
 * live Send-ETA flow (useArrivalEta, which picks the boat you're on) and the
 * leave-by plan (usePlannedArrival, which uses the sailing you're told to catch).
 * Keeping one implementation means the two can never disagree on crossing or
 * far-side transit time.
 */
import {
  Route,
  FERRY_TO_HOME_FALLBACK_MINUTES,
  HISTORY_MIN_SAMPLES,
  crossingMinutesForRoute,
} from './constants';
import { TransitRecord, TransitRoute, Vehicle, DepartureSnapshot } from '../types/storage';
import { addMinutes } from './time';
import { typicalCrossingMinutes } from './typicalCrossing';
import { computeTypicalTransitSeconds, TypicalMethod } from './transitStats';

export type ArrivalKind = 'home' | 'office';

export interface ArrivalEta {
  kind: ArrivalKind;
  label: string; // e.g. "Home by", "At office by"
  etaTime: Date | null;
  ferryArrivalTime: Date | null;
  transitMinutes: number;
  transitMethod: TypicalMethod | 'default';
  sampleSize: number;
  vehicle: Vehicle;
  transitRoute: TransitRoute;
}

// Map ferry direction to which arrival we compute and which transit segment to use.
// The far-side leg is always timed by bike (the Timer only records it that way).
export const ARRIVAL_CONFIG: Partial<Record<Route, {
  kind: ArrivalKind;
  label: string;
  transitRoute: TransitRoute;
  vehicle: Vehicle;
  fallbackMinutes: number;
}>> = {
  'seattle-bainbridge': {
    kind: 'home',
    label: 'Home by',
    transitRoute: 'ferry-to-home',
    vehicle: 'bike',
    fallbackMinutes: FERRY_TO_HOME_FALLBACK_MINUTES,
  },
  'bainbridge-seattle': {
    kind: 'office',
    label: 'At office by',
    transitRoute: 'ferry-to-work',
    vehicle: 'bike',
    fallbackMinutes: 15,
  },
};

/**
 * Arrival for a sailing leaving at `departureTime`. `liveEta` is the vessel's
 * live arrival estimate once it's underway (that IS the real arrival); without
 * it, use the route's measured typical crossing, then the nominal crossing.
 * Returns null for routes we don't compute arrival for.
 */
export function computeArrival(params: {
  route: Route;
  departureTime: Date;
  liveEta?: Date | null;
  transitRecords: TransitRecord[] | undefined;
  trends: DepartureSnapshot[] | undefined;
}): ArrivalEta | null {
  const { route, departureTime, liveEta, transitRecords, trends } = params;
  const config = ARRIVAL_CONFIG[route];
  if (!config) return null;

  let ferryArrivalTime: Date;
  if (liveEta && liveEta.getTime() > departureTime.getTime()) {
    ferryArrivalTime = liveEta;
  } else {
    const typicalCrossing = typicalCrossingMinutes(trends, route);
    const crossing =
      typicalCrossing.minutes != null && typicalCrossing.sampleSize >= HISTORY_MIN_SAMPLES
        ? typicalCrossing.minutes
        : crossingMinutesForRoute(route);
    ferryArrivalTime = addMinutes(departureTime, crossing);
  }

  let transitMinutes = config.fallbackMinutes;
  let transitMethod: TypicalMethod | 'default' = 'default';
  let sampleSize = 0;

  if (transitRecords && transitRecords.length > 0) {
    const matching = transitRecords.filter(
      r => r.route === config.transitRoute && r.vehicle === config.vehicle
    );
    const typical = computeTypicalTransitSeconds(matching);
    if (typical) {
      transitMinutes = Math.ceil(typical.seconds / 60);
      transitMethod = typical.method;
      sampleSize = typical.sampleSize;
    }
  }

  return {
    kind: config.kind,
    label: config.label,
    etaTime: addMinutes(ferryArrivalTime, transitMinutes),
    ferryArrivalTime,
    transitMinutes,
    transitMethod,
    sampleSize,
    vehicle: config.vehicle,
    transitRoute: config.transitRoute,
  };
}
